class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // Searching the Keywords that match our data
    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i",

            }
        } : {};

        console.log(keyword);
        this.query = this.query.find({ ...keyword })
        return this;
    }

    // Filtering the search in the data

    filter() {
        const queryCopy = { ...this.queryStr };
        console.log(queryCopy);
        // removing some fields from category
        const removeFields = ["keyword", "page", "limit"];

        removeFields.forEach(key => delete queryCopy[key]);
        console.log(queryCopy);



        // Filtering for price and ratings
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
        this.query = this.query.find(JSON.parse(queryStr));
        console.log(queryStr);
        return this;
    }

    // Pagination per Products
    pagination(productsPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;

        const skipPage = productsPerPage * (currentPage - 1);
        this.query = this.query.limit(productsPerPage).skip(skipPage);
        return this;
    }
}

module.exports = ApiFeatures;