import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Thêm cái này để dùng routerLink
import { QuillModule } from 'ngx-quill';
@Component({
  selector: 'app-quill-editor',
  imports: [CommonModule, FormsModule, RouterModule, QuillModule],
  standalone: true,
  templateUrl: './quill-editor.component.html',
  styleUrl: './quill-editor.component.css'
})
export class QuillEditorComponent {

editorContent = '';
  
  editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video', 'code-block'],
      ['clean']
    ]
  };
}
