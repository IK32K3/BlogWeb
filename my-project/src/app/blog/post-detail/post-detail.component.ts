import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ActivatedRoute } from '@angular/router';
import { BlogPostService } from '../services/blog-post.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule,FormsModule,RouterOutlet,SharedModule ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  post: any;
  relateposts: any[] = [];
  comments: any[] = [];
  newComment = '';

  constructor(
    private route: ActivatedRoute,
    private blogPostService: BlogPostService
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (!param) return;

    // Nếu param là số thì lấy theo id, nếu là chuỗi thì lấy theo slug
    if (!isNaN(Number(param))) {
      this.blogPostService.getPostById(Number(param)).subscribe(res => {
        this.handlePostResponse(res);
      });
    } else {
      this.blogPostService.getPostBySlug(param).subscribe(res => {
        this.handlePostResponse(res);
      });
    }
  }

  handlePostResponse(res: any) {
    // Lấy đúng post từ data.post
    this.post = res?.data?.post || res?.post || res?.data || res;
    // Lấy bài viết liên quan
    if (this.post && (this.post.category_id || this.post.categories?.id)) {
      const categoryId = this.post.category_id || this.post.categories?.id;
      this.blogPostService.getRelatedPosts(categoryId).subscribe(r => {
        const related = r?.data || r?.posts || [];
        this.relateposts = related.filter((p: any) => p.id !== this.post.id);
      });
    }
    // Lấy bình luận
    if (this.post && this.post.id) {
      this.blogPostService.getComments(this.post.id).subscribe(c => {
        this.comments = c?.data || c?.comments || [];
      });
    }
  }

  postComment() {
    if (this.newComment.trim() && this.post?.id) {
      this.blogPostService.postComment(this.post.id, { text: this.newComment }).subscribe(res => {
        const comment = res?.data || res?.comment || res;
        this.comments.unshift(comment);
        this.newComment = '';
      });
    }
  }
}
