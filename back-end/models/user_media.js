'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserMedia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      UserMedia.belongsTo(models.User, { foreignKey: 'user_id' , as: 'user' });
      UserMedia.belongsTo(models.Media, { foreignKey: 'media_id' , as: 'media' });
    }
  }
  UserMedia.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    media_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    modelName: 'UserMedia',
    tableName: 'user_media',
    timestamps: false // Disable Sequelize's automatic timestamps
  });
  return UserMedia;
};