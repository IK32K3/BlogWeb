Use blogweb;

CREATE TABLE `Users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) UNIQUE NOT NULL,
  `password` varchar(100) NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `role` varchar(100),
  `theme_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` boolean NOT NULL DEFAULT false
);	


CREATE TABLE `Posts` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(300) NOT NULL,
  `content` longtext NOT NULL,
  `description` longtext NOT NULL,
  `slug` varchar(150) NOT NULL,
  `id_post_original` int,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `Category` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- DROP TABLE IF EXISTS `PostTransLanguage`;

-- CREATE TABLE `PostCategories` (
--   `category_id` int NOT NULL,
--   `post_id` int NOT NULL,
--   PRIMARY KEY (post_id,category_id)
-- );
CREATE TABLE `Category_Translate_Language` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `language_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` boolean DEFAULT false,
  
  FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES Languages(id) ON DELETE CASCADE,
  
  UNIQUE (`category_id`, `language_id`)
);

CREATE TABLE `Comments` (
  `id` int PRIMARY KEY,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `Languages` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` boolean NOT NULL DEFAULT true
);
-- CREATE TABLE `Themes` (
--   `id` int PRIMARY KEY,
--   `name` varchar(50) NOT NULL,
--   `css_file` varchar(255),
--   `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
--   `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );
-- DROP TABLE IF EXISTS `PostTransLanguage`;

CREATE TABLE `Post_Translate_Language` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `language_id` int NOT NULL,
  `title` varchar(300) NOT NULL,
  `content` longtext NOT NULL,
  `description` longtext NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_original` boolean DEFAULT false,
  FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES Languages(id) ON DELETE CASCADE,
  
  UNIQUE (`post_id`, `language_id`)
);

CREATE TABLE `Setting` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `settings` json NOT NULL,
  
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  UNIQUE (`user_id`)
  
);


CREATE INDEX `Category_Translate_Language_index_0` ON `Category_Translate_Language` (`category_id`);

CREATE INDEX `Category_Translate_Language_index_1` ON `Category_Translate_Language` (`language_id`);

CREATE UNIQUE INDEX `Category_Translate_Language_index_2` ON `Category_Translate_Language` (`category_id`, `language_id`);

CREATE INDEX `Post_Translate_Language_index_3` ON `Post_Translate_Language` (`post_id`);

CREATE INDEX `Post_Translate_Language_index_4` ON `Post_Translate_Language` (`language_id`);

CREATE UNIQUE INDEX `Post_Translate_Language_index_5` ON `Post_Translate_Language` (`post_id`, `language_id`);

CREATE INDEX `Setting_index_6` ON `Setting` (`user_id`);

CREATE UNIQUE INDEX `Setting_index_7` ON `Setting` (`user_id`);

ALTER TABLE `Posts` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

ALTER TABLE `Posts` ADD FOREIGN KEY (`category_id`) REFERENCES `Category` (`id`);

ALTER TABLE `Posts` ADD FOREIGN KEY (`id_post_original`) REFERENCES `Posts` (`id`);

ALTER TABLE `Category_Translate_Language` ADD FOREIGN KEY (`category_id`) REFERENCES `Category` (`id`);

ALTER TABLE `Category_Translate_Language` ADD FOREIGN KEY (`language_id`) REFERENCES `Languages` (`id`);

ALTER TABLE `Comments` ADD FOREIGN KEY (`post_id`) REFERENCES `Posts` (`id`);

ALTER TABLE `Comments` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

ALTER TABLE `Post_Translate_Language` ADD FOREIGN KEY (`post_id`) REFERENCES `Posts` (`id`);

ALTER TABLE `Post_Translate_Language` ADD FOREIGN KEY (`language_id`) REFERENCES `Languages` (`id`);

ALTER TABLE `Setting` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);



