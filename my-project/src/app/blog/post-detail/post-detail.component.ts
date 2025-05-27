import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ActivatedRoute } from '@angular/router';
import { BlogPostService } from '../services/blog-post.service';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule,FormsModule,RouterOutlet,HeaderComponent,FooterComponent],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent  {
  post = {
  imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  category: 'Writing & Blogging',
  title: 'How to Write Professional Blogs That Attract Readers',
  author: {
    name: 'John Smith',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  date: 'March 21, 2025',
  readTime: '8 min read',
  introQuote: "Blogging isn't just about sharing thoughts, it's a skill that needs practice to attract readers.",
  section1: "Effective blogging starts with clearly identifying...",
  tip1: "Create reader personas with characteristics like age, occupation, etc.",
  section2: "Even when writing about professional topics...",
  languageTips: [
    { title: 'Avoid overly complex terminology', detail: 'If you must use it, provide a brief explanation' },
    { title: 'Write concise, readable sentences', detail: 'Long-winded sentences can easily make readers lose focus' },
    { title: 'Use illustrative examples', detail: 'Helps readers visualize the issue' },
  ],
  imageTipUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  imageTipCaption: 'A comfortable writing space helps improve article quality',
  quote: 'Blogging is an art, and the blogger is an artist...',
  quoteAuthor: 'Sarah Johnson, Professional Blogger',
  section3: 'Quality content is the most important factor...',
  qualityTips: [
    { title: 'Break articles into small paragraphs', detail: 'Each paragraph should present one main idea' },
    { title: 'Use images and videos for illustration', detail: 'Multimedia content makes articles more vivid' },
    { title: 'Check spelling and grammar', detail: 'Spelling mistakes reduce article credibility' },
    { title: 'Update information regularly', detail: 'Ensure content is always fresh and accurate' }
  ],
  ctaNote: "Don't forget to add a call-to-action (CTA)...",
  finalNote: "Blogging isn't just about creating content...",
  tags: ['writing', 'blogging', 'content'],
  likes: 248
};
  relateposts = [
    {
      image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Content Marketing',
      title: '10 Effective Content Marketing Strategies for 2025',
      description: 'Discover the latest content marketing trends to attract customers...',
      readTime: '5 min read'
    },
    {
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'SEO',
      title: 'Complete On-Page SEO Guide for Beginners',
      description: 'Optimize your articles for SEO to improve search rankings...',
      readTime: '7 min read'
    },
    {
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Monetization',
      title: '7 Most Effective Ways to Monetize Your Blog',
      description: 'Share proven methods to make money from blogging...',
      readTime: '6 min read'
    }
  ];
comments = [
    {
      userImage: 'https://randomuser.me/api/portraits/men/75.jpg',
      username: 'user****@gmail.com',
      timeAgo: '1 day ago',
      text: 'This needs serious punishment as a deterrent. Uncouth behavior in public spaces should be eliminated in the future.',
      likes: 42,
      isTop: true,
      isMostLiked: true
    },
    {
      userImage: 'https://randomuser.me/api/portraits/men/55.jpg',
      username: 'Michael Tran',
      timeAgo: '10 minutes ago',
      text: 'This is such great news!',
      likes: 3,
      isTop: false,
      isMostLiked: false
    },
    {
      userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      username: 'Sarah Johnson',
      timeAgo: '2 hours ago',
      text: 'Very helpful article! I\'ve applied these tips and seen clear results after 1 month. Thank you author!',
      likes: 12,
      isTop: false,
      isMostLiked: false
    }
  ];
  
  newComment = '';

  postComment() {
    if (this.newComment.trim()) {
      const newComment = {
        userImage: 'https://randomuser.me/api/portraits/men/76.jpg',
        username: 'New User',
        timeAgo: 'Just now',
        text: this.newComment,
        likes: 0,
        isTop: false,
        isMostLiked: false
      };
      this.comments.unshift(newComment);  // Add new comment to the top
      this.newComment = '';  // Clear the input field
    }
  }
}
//   post: any;
//   relateposts: any[] = [];
//   comments: any[] = [];
//   newComment = '';

//   constructor(
//     private route: ActivatedRoute,
//     private blogPostService: BlogPostService
//   ) {}

//   ngOnInit(): void {
//     const param = this.route.snapshot.paramMap.get('id');
//     if (!param) return;

//     // Nếu param là số thì lấy theo id, nếu là chuỗi thì lấy theo slug
//     if (!isNaN(Number(param))) {
//       this.blogPostService.getPostById(Number(param)).subscribe(res => {
//         this.handlePostResponse(res);
//       });
//     } else {
//       this.blogPostService.getPostBySlug(param).subscribe(res => {
//         this.handlePostResponse(res);
//       });
//     }
//   }

//   handlePostResponse(res: any) {
//     // Lấy đúng post từ data.post
//     this.post = res?.data?.post || res?.post || res?.data || res;
//     // Lấy bài viết liên quan
//     if (this.post && (this.post.category_id || this.post.categories?.id)) {
//       const categoryId = this.post.category_id || this.post.categories?.id;
//       this.blogPostService.getRelatedPosts(categoryId).subscribe(r => {
//         const related = r?.data || r?.posts || [];
//         this.relateposts = related.filter((p: any) => p.id !== this.post.id);
//       });
//     }
//     // Lấy bình luận
//     if (this.post && this.post.id) {
//       this.blogPostService.getComments(this.post.id).subscribe(c => {
//         this.comments = c?.data || c?.comments || [];
//       });
//     }
//   }

//   postComment() {
//     if (this.newComment.trim() && this.post?.id) {
//       this.blogPostService.postComment(this.post.id, { text: this.newComment }).subscribe(res => {
//         const comment = res?.data || res?.comment || res;
//         this.comments.unshift(comment);
//         this.newComment = '';
//       });
//     }
//   }
// }
