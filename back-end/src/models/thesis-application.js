module.exports = (sequelize, DataTypes) => {
    const ThesisApplication = sequelize.define('ThesisApplication', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,

        },
        topic: {
            type: DataTypes.STRING,
            allowNull: false
        },
        submissionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'submission_date'
        },
    }, {
        tableName: 'thesis_application',
        timestamps: false
    });

    return ThesisApplication;
};