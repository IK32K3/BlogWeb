Use blogweb;

CREATE TABLE `Users` (
   `id` INT PRIMARY KEY AUTO_INCREMENT,
   `username` VARCHAR(50) UNIQUE NOT NULL,
   `password` VARCHAR(100) NOT NULL,
   `email` VARCHAR(255) UNIQUE NOT NULL,
   `avatar` VARCHAR(255) UNIQUE NOT NULL,
   `role_id` INT NOT NULL,
   `description` LONGTEXT NOT NULL,
   `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
   `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `is_active` BOOLEAN NOT NULL DEFAULT TRUE -- Thay đổi từ TINYINT(1) thành BOOLEAN
);

CREATE TABLE `Categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug ` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `Role` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE `Languages` (
   `id` INT PRIMARY KEY AUTO_INCREMENT,
   `name` VARCHAR(50) NOT NULL,
   `locale` VARCHAR(10) NOT NULL,
   `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
   `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `is_active` BOOLEAN NOT NULL DEFAULT TRUE -- Thay vì TINYINT(1)
);

CREATE TABLE `Posts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(300) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `view` INT NOT NULL DEFAULT 0,
  `description` LONGTEXT NOT NULL,
  `slug` VARCHAR(150) NOT NULL,
  `thumbnail` VARCHAR(255) NOT NULL,
  `id_post_original` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `Categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_post_original`) REFERENCES `Posts`(`id`) ON DELETE SET NULL,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft'
);

CREATE TABLE `Category_Translate_Language` (
   `id` INT PRIMARY KEY AUTO_INCREMENT,
   `category_id` INT NOT NULL,
   `language_id` INT NOT NULL,
   `name` VARCHAR(50) NOT NULL,
   `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
   `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `is_active` BOOLEAN DEFAULT FALSE, -- Thay TINYINT(1) bằng BOOLEAN
   FOREIGN KEY (`category_id`) REFERENCES `Categories`(`id`) ON DELETE CASCADE,
   FOREIGN KEY (`language_id`) REFERENCES `Languages`(`id`) ON DELETE CASCADE
);

CREATE TABLE `Comments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `post_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`post_id`) REFERENCES `Posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE
);


CREATE TABLE `Post_Translate_Language` (
   `id` INT PRIMARY KEY AUTO_INCREMENT,
   `post_id` INT NOT NULL,
   `language_id` INT NOT NULL,
   `title` VARCHAR(300) NOT NULL,
   `content` LONGTEXT NOT NULL,
   `description` LONGTEXT NOT NULL,
   `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
   `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `is_original` BOOLEAN DEFAULT FALSE,  -- Thay vì TINYINT(1)
   FOREIGN KEY (`post_id`) REFERENCES `Posts`(`id`) ON DELETE CASCADE,
   FOREIGN KEY (`language_id`) REFERENCES `Languages`(`id`) ON DELETE CASCADE
);


CREATE TABLE `Setting` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT UNIQUE,
  `settings` JSON NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE
);

-- 🔹 INDEXES
CREATE UNIQUE INDEX `Category_Translate_Language_unique` ON `Category_Translate_Language` (`category_id`, `language_id`);
CREATE UNIQUE INDEX `Post_Translate_Language_unique` ON `Post_Translate_Language` (`post_id`, `language_id`);


SELECT * FROM posts;


-- DROP TABLE IF EXISTS SequelizeMeta;

-- SHOW INDEX FROM Post_Translate_Language;-- 
-- SHOW INDEX FROM setting;
-- DROP INDEX Setting_index_7 ON setting;
-- SHOW INDEXES FROM category_translate_language;
