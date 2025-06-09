import { ElevatorSharp } from "@mui/icons-material";
import {createSlice} from "@reduxjs/toolkit";

const initialStateValue = {
    mode:"light",
    user:null,
    token:null,
    posts:[1,2,3],
};
export const authSlice =  createSlice({
    name:"auth",
    initialState: {value: initialStateValue},
    reducers:{
        setMode:(state)=>{
            state.value.mode = state.value.mode==="light"?"dark":"light";
        },
        setLogin:(state,action)=>{
            state.value.user = action.payload.user;
            state.value.token = action.payload.token;
        },
        setLogout:(state)=>{
            state.value.user = null;
            state.value.token = null;
        },
        setFriends:(state,action)=>{
            if(state.value.user){
                state.value.user.friends = action.payload.friends;
            }
            else{
                console.error("User has no friends");
            }
        },
        setPosts:(state,action)=>{
            state.value.posts = action.payload.posts;
        },
    }
})

export const {setMode,setLogin,setLogout, setFriends, setPosts, setPost} = authSlice.actions;
export default authSlice.reducer;