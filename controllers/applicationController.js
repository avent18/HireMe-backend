import { Application } from "../models/applicationmodel.js";
import { Job } from "../models/jobmodel.js";
 
 

export const applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;

    if(!jobId) {
      return res.status(400).json({ message: "Job ID is required", success: false });
    }


    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    const checkApplication = await Application.findOne({ job:jobId, applicant:userId });
    if (checkApplication) {
      return res.status(400).json({ message: "You have already applied for this job", success: false });
    }
    

    const newApplication = new Application({
      job: jobId,
      applicant: userId,})
      job.applications.push(newApplication._id);
    await job.save();
    await newApplication.save();
    return res.status(200).json({
      message: "Application submitted successfully",
      success: true,
      application: newApplication,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    return res.status(500).json({ message: "Internal server error" });
    
  }
}

//get Applied jobs
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const applications = await Application.find({ applicant: userId }).sort({ createdAt: -1 })
      .populate({path:'job',
        options:{sort:{createdAt:-1}},
        populate:{
          path:'company', 
          options:{sort:{createdAt:-1}}},
      })
      if(!applications){
        return res.status(404).json({ message: "No applications found", success: false });
      }
      return res.status(200).json({
        message: "Applied jobs fetched successfully",
        success: true,
        applications,
      });
    
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    return res.status(500).json({ message: "Internal server error" });
    
  }
}

//get all applications for a job seeing by admin
export const getApplicants = async (req, res)=>{
  try {
    const jobId = req.params.id;
    if(!jobId) {
      return res.status(400).json({ message: "Job ID is required", success: false });
    }
    const job = await Job.findById(jobId).populate({
      path: 'applications',
      options: { sort: { createdAt: -1 } },
      populate: {
        path: 'applicant',
      },
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    return res.status(200).json({
      job,
      message: "Applicants fetched successfully",
      success: true,
      applicants: job.applications,
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({ message: "Internal server error" }); 
    
  }
}

//update application status by admin
export const updateStatus = async (req, res)=>{
  try {
    const {status} = req.body;
    const applicationId = req.params.id
    if(!status){
      return res.status(400).json({ message: "Status is required", success: false });
    }

    const application = await Application.findOne({_id:applicationId});
    if (!application) {
      return res.status(404).json({ message: "Application not found", success: false });
    }
    //update the status
    application.status = status.toLowerCase();
    await application.save();
    return res.status(200).json({
      message: "Application status updated successfully",
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ message: "Internal server error" });
    
  }
}