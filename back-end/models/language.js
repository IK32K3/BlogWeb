'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Language extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Language.hasMany(models.PostTranslateLanguage, {
        foreignKey: 'language_id',
        as: 'translations'
      });
    }
  }
  Language.init({
    locale: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Language',
    tableName: 'languages',
    timestamps: true,
      // --- THÊM underscored ĐỂ KHỚP VỚI TÊN CỘT created_at/updated_at ---
      underscored: true // Rất quan trọng nếu tên cột DB có dấu gạch dưới
  });
  return Language;
};