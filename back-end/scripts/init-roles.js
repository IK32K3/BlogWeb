require('dotenv').config(); // Load biến môi trường từ .env
const db = require('../models'); // Import models/index.js

async function initRoles() {
  try {
    await db.sequelize.sync(); // Đảm bảo DB đã sẵn sàng

    const roles = ['admin', 'Blogger', 'Viewer'];

    for (const roleName of roles) {
      const [role, created] = await db.Role.findOrCreate({
        where: { name: roleName }
      });

      if (created) {
        console.log(`✅ Role '${roleName}' đã được tạo.`);
      } else {
        console.log(`ℹ️ Role '${roleName}' đã tồn tại.`);
      }
    }

    console.log('🎉 Hoàn tất khởi tạo roles!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi khởi tạo roles:', err);
    process.exit(1);
  }
}

initRoles();
