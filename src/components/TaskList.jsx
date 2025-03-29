import axios from "axios"
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
import { URL } from "../App"
import Task from "./Task"
import TaskForm from "./TaskForm"
import loadingImg from "../assets/loader.gif"


const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [taskID, setTaskID] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    completed: false
  });
  const { name } = formData 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createTask = async (e) => {
    e.preventDefault();
   if (name === "") {
    return toast.error("Input cannot be empty");
   }
   //  // Make API call to add a new task to the database

   try {
    // Add task to the database  
    await axios.post(`${URL}/api/tasks`, formData);
    toast.success(`Task "${formData.name}" added successfully!`);
     setFormData({...formData, name: "" }); // Set form data back to empty
     getTasks()
   } catch (error) {
    toast.error(error.message);
    console.error(error);
   }
    
  };

   // Get tasks to the database
  const getTasks = async() =>{
    setIsLoading(true);
    try {
      const {data} = await axios.get(`${URL}/api/tasks`)
      setTasks(data)
      setIsLoading(false)
    } catch (error) {
      toast.error(error.message);
      console.error(error);
      setIsLoading(false);
    }
   
  };

  useEffect(() => {
    getTasks();
  }, []);

  // handle the delete task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${URL}/api/tasks/${id}`);
      toast.success("Task deleted successfully");
      getTasks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const cTask = tasks.filter((task) =>{
      return task.completed === true
    })
    setCompletedTasks(cTask)
  }, [tasks]);

 // handle the getSingletask
  const getSingleTask = async (task) => {
    setFormData({name: task.name, completed: false})
    setTaskID(task._id) 
    setIsEditing(true)
  };
  const updateTask = async (e) => {
    e.preventDefault()
    if(name === ""){
      return toast.error("Input field cannot be empty.")
    }
    try {
      await axios.put(`${URL}/api/tasks/${taskID}`, formData)
      setFormData({...formData, name: ""}) // empty the field 
      setIsEditing(false) // exit editing mode
      getTasks() // pull up the tasks=
    } catch (error) {
      toast.error(error.message)
    }
  };
  const setToComplete = async (task) => {
    const newFormData = {
      name: task.name,
      completed: true,
    }
    try {
      await axios.put(`${URL}/api/tasks/${task._id}`, newFormData)
      getTasks()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div>
        <h2>Task Manager</h2>
       <TaskForm 
       name={name} 
       handleInputChange={handleInputChange} 
       createTask={createTask}
       isEditing={isEditing}
       updateTask={updateTask}
       />   
        {tasks.length > 0 && (
          <div className='--flex-between --pb'>
            <p>
              <b>Total Tasks:</b> 
              {tasks.length}
            </p>
            <p>
              <b>Completed Tasks: </b> 
              {completedTasks.length}
            </p>
          </div>

        )}
       
       <hr/>
       {
        isLoading && (
          <div className="--flex-center">
            <img src={loadingImg} alt="loading" />
          </div>
        )
       }
       {
        !isLoading && tasks.length === 0 ? (
          <p className="--py">No task added. Please add a task</p>
        ):(
          <>
          {tasks.map((task, index) => {
            return (
              <Task 
                key={task._id} 
                task={task}
                index={index}
                deleteTask={deleteTask}
                getSingleTask={getSingleTask}
                setToComplete={setToComplete}
                />
            )
          })}
          </>
        )
       }
    </div>
  );
};

export default TaskList



