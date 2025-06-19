'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Định nghĩa các associations
      User.hasMany(models.Post, {
        foreignKey: 'user_id',
        as: 'posts'
      });
      
      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments'
      });

      User.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
      });

      User.hasOne(models.Setting, {
        foreignKey: 'user_id',
        as: 'settings'
      });

    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  return User;
};