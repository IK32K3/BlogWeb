import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from 'app/shared/components/header-admin/header-admin.component';
import { SlidebarAdminComponent } from 'app/shared/components/slidebar-admin/slidebar-admin.component';
import { CommentsService, CommentsListResponse } from 'app/core/services/comments.service';
import { Comment } from 'app/shared/model/comment.model';
import Swal from 'sweetalert2';
import { UsersService } from 'app/core/services/users.service';
import { BlogPostService } from 'app/core/services/blog-post.service';
// ViewModel for UI
interface CommentViewModel extends Comment {
  userName: string;
  postTitle: string;
  selected: boolean;
}

@Component({
  selector: 'app-admin-comments',
  standalone: true,
  imports: [HeaderAdminComponent, SlidebarAdminComponent, FormsModule, CommonModule],
  templateUrl: './admin-comments.component.html',
  styleUrl: './admin-comments.component.css'
})
export class AdminCommentsComponent implements OnInit {
  // Dashboard stats
  totalComments = 0;
  pendingComments = 0;
  hiddenComments = 0;
  spamRate = 0;

  // Table/filter/pagination
  comments: CommentViewModel[] = [];
  filter = { keyword: '', status: '', userName: '', postTitle: '' };
  filteredComments: CommentViewModel[] = [];
  pagedComments: CommentViewModel[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalPagesArray: number[] = [];

  users: string[] = [];
  posts: string[] = [];

  constructor(
    private commentsService: CommentsService,
    private userService: UsersService,
    private postService: BlogPostService
  ) {}

  ngOnInit() {
    this.fetchUsers();
    this.fetchPosts();
    this.fetchComments();
  }

  fetchComments() {
    this.commentsService.getAllComments({
      limit: 10000, // lấy tất cả, backend nên hỗ trợ
      keyword: this.filter.keyword,
      status: this.filter.status,
      userName: this.filter.userName,
      postTitle: this.filter.postTitle
    }).subscribe(res => {
      this.comments = res.data.comments.map(c => this.toViewModel(c));
      this.updateStats();
      this.applyFilter();
    });
  }

  fetchUsers() {
    // Gọi service lấy danh sách user, ví dụ:
    this.userService.getAll().subscribe(res => {
      this.users = res.data.users.map((u: any) => u.username);
    });
  }

  fetchPosts() {
    // Gọi service lấy danh sách bài viết, ví dụ:
    this.postService.getAll().subscribe(res => {
      this.posts = res.data.posts.map((p: any) => p.title);
    });
  }

  toViewModel(c: Comment): CommentViewModel {
    return {
      ...c,
      userName: c.user?.username || '',
      postTitle: c.post?.title || '',
      selected: false
    };
  }

  updateStats() {
    this.totalComments = this.comments.length;
    this.pendingComments = this.comments.filter(c => !(c as any).approved && !(c as any).hidden && !(c as any).spam).length;
    this.hiddenComments = this.comments.filter(c => (c as any).hidden).length;
    this.spamRate = 0; // Tính toán tỉ lệ spam nếu có
  }

  applyFilter() {
    this.filteredComments = this.comments.filter(c => {
      return (!this.filter.keyword || c.content.toLowerCase().includes(this.filter.keyword.toLowerCase()) || c.userName.toLowerCase().includes(this.filter.keyword.toLowerCase()))
        && (!this.filter.userName || c.userName.toLowerCase().includes(this.filter.userName.toLowerCase()))
        && (!this.filter.postTitle || c.postTitle.toLowerCase().includes(this.filter.postTitle.toLowerCase()));
    });
    this.currentPage = 1;
    this.updatePagination();
    this.updateStats();
  }

  resetFilter() {
    this.filter = { keyword: '', status: '', userName: '', postTitle: '' };
    this.applyFilter();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredComments.length / this.pageSize) || 1;
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.pagedComments = this.filteredComments.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  isAllSelected() {
    return this.pagedComments.length > 0 && this.pagedComments.every(row => row.selected);
  }

  toggleAllRows(event: any) {
    const checked = event.target.checked;
    this.pagedComments.forEach(row => row.selected = checked);
  }

  hasSelectedRows() {
    return this.pagedComments.some(row => row.selected);
  }



  async editComment(row: CommentViewModel) {
    const { value: newContent } = await Swal.fire({
      title: 'Chỉnh sửa bình luận',
      input: 'textarea',
      inputLabel: 'Nội dung mới',
      inputValue: row.content,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy',
      inputAttributes: {
        rows: '3',
        style: 'resize: none;'
      },
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Nội dung không được để trống!';
        }
        if (value === row.content) {
          return 'Nội dung chưa thay đổi!';
        }
        return null;
      },
      customClass: {
        input: 'swal2-textarea',
        confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        cancelButton: 'bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300',
        popup: 'rounded-xl'
      }
    });
    if (newContent) {
      this.commentsService.updateComment(row.id, { content: newContent }).subscribe({
        next: (res) => {
          const comment = res.comment;
          if (comment) {
            row.content = comment.content;
            row.updatedAt = comment.updatedAt;
          }
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: 'Bình luận đã được cập nhật!',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
          });
          this.fetchComments(); // Reload lại danh sách bình luận
        },
        error: () => {
          Swal.fire('Lỗi', 'Cập nhật bình luận thất bại!', 'error');
        }
      });
    }
  }



  blockUser(row: CommentViewModel) {
    // TODO: Gọi API chặn user
  }

  deleteComment(row: CommentViewModel) {
    Swal.fire({
      title: 'Bạn có chắc muốn xóa bình luận này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.commentsService.deleteComment(row.id).subscribe({
          next: () => {
            this.comments = this.comments.filter(r => r.id !== row.id);
            this.applyFilter();
            Swal.fire('Đã xóa!', 'Bình luận đã được xóa.', 'success');
          },
          error: () => {
            Swal.fire('Lỗi', 'Không thể xóa bình luận.', 'error');
          }
        });
      }
    });
  }

  bulkDelete() {
    Swal.fire({
      title: 'Bạn có chắc muốn xóa các bình luận đã chọn?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        const idsToDelete = this.comments.filter(r => r.selected).map(r => r.id);
        Promise.all(idsToDelete.map(id => this.commentsService.deleteComment(id).toPromise()))
          .then(() => {
            this.comments = this.comments.filter(r => !r.selected);
            this.applyFilter();
            Swal.fire('Đã xóa!', 'Các bình luận đã được xóa.', 'success');
          })
          .catch(() => {
            Swal.fire('Lỗi', 'Không thể xóa các bình luận.', 'error');
          });
      }
    });
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
