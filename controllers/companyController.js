import { Company } from "../models/companymodel.js"; 
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new company
export const registerCompany = async (req, res) => {
  try {
    const {companyName} = req.body;
    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required",
        success: false,
      });
    }

    let company = await Company.findOne({ name: companyName });
    if (company) {
      return res.status(400).json({
        message: "Company already exists",
        success: false,
      });
    }

    company = await Company.create({
      name: companyName,
      userId: req.id, // Assuming req.id is set by an authentication middleware
    });
    return res.status(201).json({
      message: "Company registered successfully",
      success: true,
      company
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
    
  }
}

// Get companies
export const getCompany = async(req, res) => {
  try {
    const userId = req.id; // Assuming req.id is set by an authentication middleware
    const companies = await Company.find({ userId });
    if (!companies || companies.length === 0) {
      return res.status(404).json({
        message: "No companies found for this user",
        success: false,
    })
  }
  return res.status(200).json({
      message: "Companies fetched successfully",
      success: true,
      companies
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
    
  }
}

//get company by userid
export const getCompanyId = async (req, res)=> {
  try {
    const companyId = req.params.id; // Assuming the company ID is passed as a URL parameter
    const company = await Company.findById(companyId).populate('userId', 'fullname email phoneNumber profile');
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Company retrieved successfully",
      success: true,
      company
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
    
  }
}

// Update company
export const updateCompany = async (req, res)=>{
  try {
    const {name, description, website, location} = req.body;
    const file = req.file; // Assuming you're using multer for file uploads
    const fileUri = getDataUri(file); // Function to get the file URI, you need to implement this
    const clouderesponse = await cloudinary.uploader.upload(fileUri.content, {
      folder: "company",
      resource_type: "auto"
    });// Upload the file to cloudinary
    const logo = clouderesponse.secure_url; // Get the secure URL of the uploaded file


    const updateData = {name, description, website, location, logo}
    const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Company updated successfully",
      success: true,
      company
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Internal server error",
      success: false,
    });
    
  }
}