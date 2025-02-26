import { create } from "zustand";

export const projectFunctionStore = create((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: async (newProject) => {
    try {
      // Validate input first
      if (!newProject.projectName || !newProject.projectType || 
          !newProject.projectDescription || !newProject.projectTech || 
          !newProject.projectImage) {
        return { success: false, message: "Please fill all required fields" };
      }

      // Add retry logic
      const maxRetries = 3;
      let retryCount = 0;
      let lastError = null;

      while (retryCount < maxRetries) {
        try {
          const res = await fetch("/api/project", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newProject),
            // Add timeout
            signal: AbortSignal.timeout(30000) // 30 second timeout
          });

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();
          set((state) => ({ projects: [...state.projects, data.data] }));
          return { success: true, message: "Project added successfully" };

        } catch (error) {
          lastError = error;
          retryCount++;
          
          // If it's not the last retry, wait before trying again
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

      // If we got here, all retries failed
      console.error("Failed to add project after retries:", lastError);
      return {
        success: false,
        message: "Connection error. Please try again or contact support if the problem persists."
      };

    } catch (error) {
      console.error("Error in addProject:", error);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again."
      };
    }
  },

  // Update other methods with similar error handling
  fetchProjects: async () => {
    try {
      const res = await fetch("/api/project", {
        signal: AbortSignal.timeout(30000)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      set({ projects: data.data });
    } catch (error) {
      console.error("Error fetching projects:", error);
      // You might want to set an error state here
      throw error;
    }
  },

  updateProject: async (uid, updatedProject) => {
    const res = await fetch(`/api/project/${uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProject),
    });

    const data = await res.json();

    if (!data.success) return { success: false, message: data.message };

    set((state) => ({
      projects: state.projects.map((project) => (project._id === uid ? data.data : project)),
    }));

    return { success: true, message: "Member updated successfully" };
  },

  deleteProject: async (uid) => {
    const res = await fetch(`/api/project/${uid}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false, message: data.message };
    }
    set((state) => ({ projects: state.projects.filter((project) => project._id !== uid) }));
    return { success: true, message: data.message };
  },
}));
