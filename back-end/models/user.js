'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
    }
  }

  User.init(
    {
      // Các cột khác giữ nguyên
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles', // Name of the referenced table
          key: 'id' // Key in the referenced table
        }
      },
      description: {
        type: DataTypes.TEXT('long'),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        // Có thể đặt defaultValue: true nếu bạn muốn user active ngay khi tạo
        defaultValue: true // Thay đổi từ false thành true nếu muốn
      },
      // --- XÓA BỎ ĐỊNH NGHĨA THỦ CÔNG CHO created_at VÀ updated_at ---
      // created_at: { ... }, <--- Xóa dòng này
      // updated_at: { ... }, <--- Xóa dòng này
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users', // Đảm bảo tên bảng khớp với database
      // --- BẬT LẠI QUẢN LÝ TIMESTAMP CỦA SEQUELIZE ---
      timestamps: true,
      // --- THÊM underscored ĐỂ KHỚP VỚI TÊN CỘT created_at/updated_at ---
      underscored: true // Rất quan trọng nếu tên cột DB có dấu gạch dưới
    }
  );

  return User;
};