import Sale from "../models/Sales.js";

export const getSales = async (req, res) => {
  try {
    const {
      search,
      region,
      gender,
      ageMin,
      ageMax,
      category,
      tags,
      payment,
      dateStart,
      dateEnd,
      sort,
      page = 1,
    } = req.query;

    const filter = {};

    // Search (Customer Name + Phone Number)
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Filters
    if (region) filter.customerRegion = { $in: region.split(",") };
    if (gender) filter.gender = { $in: gender.split(",") };
    if (category) filter.productCategory = { $in: category.split(",") };
    if (payment) filter.paymentMethod = { $in: payment.split(",") };
    if (tags) filter.tags = { $in: tags.split(",") };

    // Age Range
    if (ageMin || ageMax) {
      filter.age = {};
      if (ageMin) filter.age.$gte = Number(ageMin);
      if (ageMax) filter.age.$lte = Number(ageMax);
    }

    // Date Range
    if (dateStart || dateEnd) {
      filter.date = {};
      if (dateStart) filter.date.$gte = new Date(dateStart);
      if (dateEnd) filter.date.$lte = new Date(dateEnd);
    }

    // Sorting
    const sortOptions = {};
    if (sort === "date") sortOptions.date = -1;
    if (sort === "quantity") sortOptions.quantity = -1;
    if (sort === "customer") sortOptions.customerName = 1;

    // Pagination
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const data = await Sale.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Sale.countDocuments(filter);

    res.json({
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
