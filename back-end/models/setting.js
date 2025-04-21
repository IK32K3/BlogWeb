'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      Setting.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Setting.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: false
    },
    
  }, {
    sequelize,
    modelName: 'Setting',
    tableName: 'settings',
    timestamps: true,
    underscored: true // Disable Sequelize's automatic timestamps
  });
  return Setting;
};