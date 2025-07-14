import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Thêm cái này để dùng routerLink
import { QuillModule } from 'ngx-quill';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UploadService, MediaResponse } from '../../../core/services/upload.service';

@Component({
  selector: 'app-quill-editor',
  imports: [CommonModule, FormsModule, RouterModule, QuillModule],
  standalone: true,
  templateUrl: './quill-editor.component.html',
  styleUrl: './quill-editor.component.css'
})
export class QuillEditorComponent implements OnChanges {
  @Input() initialContent: string = '';
  @Output() contentChange = new EventEmitter<string>();

  editorContent = '';
  quillInstance: any;

  constructor(private uploadService: UploadService, private toastr: ToastrService) {}

  ngOnInit() {
    this.editorContent = this.initialContent;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialContent'] && changes['initialContent'].currentValue !== undefined) {
      this.editorContent = changes['initialContent'].currentValue || '';
    }
  }

  onEditorCreated(quill: any) {
    this.quillInstance = quill;
    // Lắng nghe sự kiện paste để tự động upload ảnh base64
    quill.root.addEventListener('paste', (e: ClipboardEvent) => {
      setTimeout(() => {
        this.handlePasteImages(quill);
      }, 100);
    });
  }

  // Hàm xử lý upload tất cả ảnh base64 trong editor sau khi dán
  private async handlePasteImages(quill: any) {
    const editorElem = quill.root;
    if (!editorElem) return;
    const imgs = editorElem.querySelectorAll('img');
    for (let img of imgs) {
      if (!img) continue;
      const src = img.getAttribute('src');
      if (src && src.startsWith('data:image')) {
        await this.uploadAndReplaceImage(img, src);
      }
    }
  }

  // Hàm upload 1 ảnh base64 và thay thế src
  private async uploadAndReplaceImage(img: Element, src: string) {
    const file = this.dataURLtoFile(src, 'image.png');
    try {
      const uploadResponses: MediaResponse[] = await firstValueFrom(this.uploadService.uploadFiles([file]));
      if (uploadResponses && uploadResponses.length > 0) {
        img.setAttribute('src', uploadResponses[0].url);
        this.toastr.success('Ảnh đã được upload thành công!');
      } else {
        this.toastr.error('Upload ảnh thất bại');
      }
    } catch (err) {
      this.toastr.error('Upload ảnh thất bại');
    }
  }

  // Helper: Chuyển base64 sang File
  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  onContentChanged(event: any) {
    this.contentChange.emit(this.editorContent);
  }

  editorModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['link', 'image', 'video']
      ],
      handlers: {
        image: () => this.imageHandler()
      }
    }
  };

  // Xử lý upload ảnh khi click vào nút ảnh trên toolbar
  async imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('multiple', '');
    input.click();

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return;
      const files: File[] = Array.from(input.files);
      if (files.length > 0) {
        try {
          const uploadResponses: MediaResponse[] = await firstValueFrom(this.uploadService.uploadFiles(files));
          if (uploadResponses && uploadResponses.length > 0) {
            const range = this.quillInstance.getSelection();
            uploadResponses.forEach(media => {
              this.quillInstance.insertEmbed(range.index, 'image', media.url);
            });
          } else {
            this.toastr.error('Upload image failed');
          }
        } catch (err) {
          this.toastr.error('Upload image failed');
        }
      }
    };
  }
}
