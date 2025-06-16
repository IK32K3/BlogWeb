import { Injectable } from '@angular/core';
import {CloudinaryModule} from '@cloudinary/ng';
import {Cloudinary, CloudinaryImage} from '@cloudinary/url-gen';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName: string = 'dejapatma'; // Replace with your actual cloud name

  constructor() {
    // You can load this from environment or API if needed
  }

  getImageUrl(publicIdOrFullUrl: string, options: any = {}): string {
    let extractedPublicId = publicIdOrFullUrl;

    // If it's a full Cloudinary URL, extract the relevant public ID part
    if (publicIdOrFullUrl.includes('cloudinary.com') && publicIdOrFullUrl.includes('/upload/')) {
      const urlParts = publicIdOrFullUrl.split('/upload/');
      if (urlParts.length > 1) {
        let segmentAfterUpload = urlParts[1];

        // This regex aims to capture the public ID after optional transformations
        // It specifically avoids stripping 'v<number>/' if it's part of the public ID.
        const publicIdRegex = /^(?:[a-z]_[a-zA-Z0-9]+(?:,[a-z]_[a-zA-Z0-9]+)*\/)*(.*)$/;
        const match = segmentAfterUpload.match(publicIdRegex);
        if (match && match[1]) {
          extractedPublicId = match[1];
        } else {
          // Fallback if regex doesn't match (unlikely for valid Cloudinary URLs)
          extractedPublicId = segmentAfterUpload;
        }
      }
    }

    // Ensure no leading or trailing slashes on the extracted public ID
    extractedPublicId = extractedPublicId.replace(/^\/+/, '').replace(/\/+$/, '');

    const transformations = this.buildTransformations(options);
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}${extractedPublicId}`;
  }

  getThumbnailUrl(publicIdOrFullUrl: string): string {
    // Simply use getImageUrl with thumbnail-specific options
    return this.getImageUrl(publicIdOrFullUrl, { width: 300, height: 300, crop: 'fill' });
  }

  private buildTransformations(options: any): string {
    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    
    return transformations.length > 0 ? transformations.join(',') + '/' : '';
  }
} 