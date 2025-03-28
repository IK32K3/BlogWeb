'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      // Example: role.hasMany(models.User, { foreignKey: 'role_id' });
    }
  }
  role.init({
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'role',
    tableName: 'roles',
    timestamps: false // Disable Sequelize's automatic timestamps
  });
  return role;
};