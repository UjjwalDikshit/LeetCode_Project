

import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axiosClient  from './utils/axiosClient';


/*
https://chatgpt.com/share/688a683e-0d58-8007-adc1-a33585d164bd

1. UI dispatches thunk → dispatch(registerThunk(userData))
2. thunk triggers POST request to backend via Axios
3. If success → fulfilled action with user data
4. If fail → rejected action with error
5. Reducer listens to each action and updates state

*/
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userDate,{rejectWithValue})=>{
        try{
            const response = await axiosClient.post('/user/register',userDate);
            return response.data.user;
        }
        catch(error){
            return rejectWithValue(error);
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/login',
    async (Credentials,{rejectWithValue}) =>{
        try{
            const response = await axiosClient.post('user/login',Credentials);
            return response.data.user;
        }
        catch(error){
            return rejectWithValue(error);
        }
    }
);

export const checkAuth  = createAsyncThunk(
    'auth/check',
    async(_,{rejectWithValue})=>{
        try{
            const {data} = await axiosClient.get('/user/check');
            return data.user;
        }
        catch(error){
            return rejectWithValue(error);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async(_,{rejectWithValue})=>{
        try{
            await axiosClient.post('/logout');
            return null;
        }catch (error){
            return rejectWithValue(error);
        }
    }
);



const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      // Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Check Auth Cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      });
  }
});

export default authSlice.reducer;


// https://chatgpt.com/share/688a746c-800c-8007-b5f3-d6669fc9a563