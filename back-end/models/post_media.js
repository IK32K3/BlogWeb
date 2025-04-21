'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostMedia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      PostMedia.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
      PostMedia.belongsTo(models.Media, { foreignKey: 'media_id' , as: 'media' });
    }
  }
  PostMedia.init({
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    media_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

  }, {
    sequelize,
    modelName: 'PostMedia',
    tableName: 'post_media',
    timestamps: true ,// Disable Sequelize's automatic timestamps
    underscored: true
  });
  return PostMedia;
};