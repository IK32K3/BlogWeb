const { body } = require("express-validator");
const stringUtils = require("utils/stringUtils");

class WithLocale 
{
    constructor(field) {
        this.withLocale = body(field)
        this.field = field;
    }

    notEmpty() {
        this.withLocale = this.withLocale.notEmpty().withMessage(stringUtils.capitalize(this.field) +" must be required").bail()
        return this
    }

    isEmail() {
        this.withLocale = this.withLocale.isEmail().withMessage(stringUtils.capitalize(this.field)+" is not in correct format").bail()
        return this
    }
    
    isLength(options) {
        if (options.min) {
            this.withLocale = this.withLocale.isLength({min: options.min}).withMessage(stringUtils.capitalize(this.field)+" must be at least " + options.min + " characters long").bail()
        }

        if (options.max) {
            this.withLocale = this.withLocale.isLength({max: options.max}).withMessage(stringUtils.capitalize(this.field)+" must be at most " + options.max + " characters long").bail()
        }

        return this;
    }

    confirmed(fieldToCompare) {
        this.withLocale = this.withLocale.custom((value, {req}) => {
            if (value !== req.body[fieldToCompare]) {
                throw new Error(stringUtils.capitalize(this.field) + " and " + fieldToCompare + " do not match");
            }
            return true;
        }).bail();

        return this;
    }

    unique (sequelizeModel, field) {
        this.withLocale = this.withLocale.custom(async (value) => {
            const recordExist = await sequelizeModel.findOne({
                where: {
                    [field]:value
                }
            })

            if (recordExist) {
                throw new Error(stringUtils.capitalize(this.field) + " must be unique")
            }
        }).bail();

        return this;
    }

    isString() {
        this.withLocale = this.withLocale.isString().withMessage(stringUtils.capitalize(this.field)+" must be text").bail()
        return this;
    }

    isNumberic() {
        this.withLocale = this.withLocale.isNumeric().withMessage(stringUtils.capitalize(this.field)+" must be number").bail()
        return this;
    }

    isIn(check, against) {
        this.withLocale = this.withLocale.isIn(check, against).withMessage(this.field + " must be in allowable range").bail();
        return this
    }
    
    isNumeric() {
        this.withLocale = this.withLocale.isNumeric().withMessage(stringUtils.capitalize(this.field) + " must be a number").bail()
        return this
    }
    isSlug() {
        this.withLocale = this.withLocale.custom((value) => {
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
                throw new Error(stringUtils.capitalize(this.field) + " is not in correct format");
            }
            return true;
        }).bail();
        return this
    }

    get() {
        return this.withLocale
    }
    trim() {
        this.withLocale = this.withLocale.trim().withMessage(stringUtils.capitalize(this.field) + " must be trimmed").bail()
        return this
    }
    optional() {
        this.withLocale = this.withLocale.optional()
        return this
    }
    isISO8601() {
        this.withLocale = this.withLocale.isISO8601().withMessage(stringUtils.capitalize(this.field) + " must be in correct format").bail()
        return this
    }
    isArray() {
        this.withLocale = this.withLocale
            .custom((value) => {
                if (!Array.isArray(value)) {
                    throw new Error(stringUtils.capitalize(this.field) + " must be an array");
                }
                return true;
            })
            .bail();
        return this;
    }
    isBoolean() {
        this.withLocale = this.withLocale.isBoolean().withMessage(stringUtils.capitalize(this.field) + " must be a boolean").bail()
        return this
    }
    isInt(options) {
        this.withLocale = this.withLocale.isInt(options).withMessage(stringUtils.capitalize(this.field) + " must be an integer").bail()
        return this
    }
    toInt() {
        this.withLocale = this.withLocale.toInt()
        return this
    }
    toDate() {
        this.withLocale = this.withLocale.toDate()
        return this
    }
    default(value) {
        this.withLocale = this.withLocale.default(value)
        return this
    }
    withMessage(message) {
        this.withLocale = this.withLocale.withMessage(message)
        return this
    }
    toBoolean() {
        this.withLocale = this.withLocale.toBoolean()
        return this
    }
    
}

module.exports = WithLocale
