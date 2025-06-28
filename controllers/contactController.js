import Contact from "../models/contact.js";

// Create new contact message
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contactData = {
      name,
      email,
      phone,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    };

    const contact = new Contact(contactData);
    await contact.save();

    res.status(201).json({
      success: true,
      message: "تم إرسال رسالتك بنجاح",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إرسال الرسالة",
      error: error.message,
    });
  }
};

// Get all contact messages (admin only)
export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الرسائل",
      error: error.message,
    });
  }
};

// Get single contact message
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "الرسالة غير موجودة",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الرسالة",
      error: error.message,
    });
  }
};

// Update contact status
export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "الرسالة غير موجودة",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث حالة الرسالة بنجاح",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث حالة الرسالة",
      error: error.message,
    });
  }
};

// Delete contact message
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "الرسالة غير موجودة",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الرسالة بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الرسالة",
      error: error.message,
    });
  }
};

// Get contact statistics
export const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Contact.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Contact.countDocuments({
      createdAt: { $gte: today },
    });

    const statsMap = {
      pending: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };

    stats.forEach((stat) => {
      statsMap[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        today: todayCount,
        byStatus: statsMap,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الإحصائيات",
      error: error.message,
    });
  }
};
