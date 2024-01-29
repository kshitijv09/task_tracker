import React, { useState, useEffect, lazy, Suspense } from "react";
import { DragDropContext,Droppable,Draggable } from "react-beautiful-dnd";
import { Link } from "react-router-dom";
import AddTask from "../../components/AddTask/AddTask";

/* import TaskCard from "../../components/TaskCard/TaskCard"; */
import Nav from "../../components/Nav/Nav";
import Loader from "../../components/Loader/Loader";
import "./Task.css";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

import { useAuth } from "../../context/AuthContext";

const TaskCard = lazy(() => import("../../components/TaskCard/TaskCard"));

export default function Reminder() {
  const { currentUser, username } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [tasks2, setTasks2] = useState([]);
  const [modal, setModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState("DueDate");
  const [filterButtton,setFilterBUtton]=useState()

  const [card, updateCard] = useState(tasks2);

  const [singleTask, setSingleTask] = useState();

  const modalHandler = () => {
    setModal((prevValue) => {
      return !prevValue;
    });
  };

  const sortingHandler = (category) => {
    setSelectedButton(category);
    if (category === "Status") {
      var arr = [...tasks2];
      arr.sort(
        (a, b) =>
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          a.completed.length - b.completed.length
      );
      //console.log(arr);
      setTasks2(arr);
      console.log("T2 is", tasks2);
    } else if (category === "DueDate") {
      console.log(category);
      var arr = [...tasks2];
      arr.sort(
        (a, b) =>
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          new Date(a.DueDate) - new Date(b.DueDate)
      );
      //console.log(arr);
      setTasks2(arr);
      console.log("T2 is", tasks2);
    }
  };


  const filteringHandler=(filter)=>{
    console.log("2 isss ",tasks2)
    let filteredTasks;
    
    switch (filter) {
        case 'Pending':
            filteredTasks = tasks.filter(todo => todo.completed==='Pending');
            break;
        case 'Completed':
            filteredTasks = tasks.filter(todo => todo.completed==='Completed');
            break;
        case 'all':
        default:
            filteredTasks = tasks;
            break;
    }

    setTasks2(filteredTasks)
  }

  const fetchTasks = async () => {
    //console.log(currentUser);
    const collectionRef = collection(db, "Tasks");
    const unsubscribe = await onSnapshot(collectionRef, (querySnapshot) => {
      const newData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      newData.sort(
        (a, b) =>
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          new Date(a.DueDate) - new Date(b.DueDate)
      );

      setTasks(newData);
      setTasks2(newData);
      return () => unsubscribe();
    });
    /* var arr=tasks;
    arr.sort((a,b)=>
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      b.DueDate - a.DueDate); */
  };


  const handleOnDragEnd=(result)=>{

    console.log("Result is ",result)
    const items = Array.from(tasks2);
    console.log("itemsare ",items)
const [reorderedItem] = items.splice(result.source.index, 1);
items.splice(result.destination.index, 0, reorderedItem);


/* updateCard(items); */
setTasks2(items)
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    console.log("Tasks2 is", tasks2);
  }, [tasks2]);

  return (
   
   
      <div className="img-cont">
        {modal && <AddTask onConfirm={modalHandler} />}

        <div className="rem-container">
          <div className="sorting">
            <div
              className="sort-btn"
              id={selectedButton === "DueDate" ? "selected-btn" : ""}
              onClick={() => {
                sortingHandler("DueDate");
              }}
            >
              DueDate
            </div>
            <div
              className="sort-btn"
              id={selectedButton === "Status" ? "selected-btn" : ""}
              onClick={() => {
                sortingHandler("Status");
              }}
            >
              Status
            </div>
            <div className="filtering">
            <div
              className="filter-btn"
              id={selectedButton === "Completed" ? "selected-btn" : ""}
              onClick={() => {
                filteringHandler("Completed");
              }}
            >
            Completed
            </div>
            <div
              className="filter-btn"
              id={selectedButton === "Incomplete" ? "selected-btn" : ""}
              onClick={() => {
                filteringHandler("Pending");
              }}
            >
              Incomplete
            </div>
            <div
              className="filter-btn"
              id={selectedButton === "Incomplete" ? "selected-btn" : ""}
              onClick={() => {
                filteringHandler("all");
              }}
            >
              All
            </div>
            </div>
          </div>
          <div className="task-heading">
            <div style={{ width: "18%" }} className="task-head">
              Title
            </div>
            <div style={{ width: "18%" }} className="task-head">
              Description
            </div>
            <div style={{ width: " 18%" }} className="task-head">
              Due Date
            </div>
            <div style={{ width: " 18%" }} className="task-head ">
              Status
            </div>
            <div style={{ width: "18%" }} className="task-head " id="creator">
              Created By
            </div>
          </div>
          <Suspense fallback={<Loader />}> 
  <DragDropContext onDragEnd={handleOnDragEnd}>
    <Droppable droppableId="characters">
      {(provided) => (
        <div 
          className="display-reminder characters" 
          {...provided.droppableProps} 
          ref={provided.innerRef}
        >
          {tasks2.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided) => ( 
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <TaskCard task={task} />
                  {provided.placeholder}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
</Suspense>

          <div className="add-rem">
            <button onClick={modalHandler} className="rem-btn">
              Add TASK
            </button>
          </div>
        </div>
      </div>
     
    /* ) */
  );
}
