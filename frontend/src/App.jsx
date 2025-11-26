import { Routes, Route } from 'react-router'
import Layout from './Components/Layout'
import Login from './Pages/Login'
import SignUp from './Pages/SignUp'
import Home from './Pages/Home'
import Profile from './Pages/Profile'
import EditProfile from './Pages/EditProfile'
import AddPost from './Pages/AddPost'
import AddStory from './Pages/AddStory'
import CommentPage from './Pages/CommentPage'
import PostById from './Pages/PostById'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/profile/edit' element={<EditProfile />} />
        <Route path='/add-post' element={<AddPost />} />
        <Route path='/add-story' element={<AddStory />} />
        <Route path='/post/:postId' element={<PostById />} />
        <Route path='/post/:postId/add-comment' element={<CommentPage />} />

      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<SignUp />} />
    </Routes>
  )
}

export default App
