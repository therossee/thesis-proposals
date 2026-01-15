module.exports = (sequelize, DataTypes) => {
    const CompanyOffice = sequelize.define(
        'company-office', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'company',
                key: 'id'
            }
        },
        street: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        postalCode: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        state_or_province: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    }, {
        tableName: 'company_office',
        timestamps: false
    });

    return CompanyOffice;
}