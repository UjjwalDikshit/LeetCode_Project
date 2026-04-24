import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all problems
        const resProblems = await axiosClient.get('/problem/getAllProblem');
        // Extract array from the "problems" key in JSON
        setProblems(resProblems.data.problems || []);

        // Fetch solved problems only if user is logged in
        if (user) {
          const resSolved = await axiosClient.get('/problem/problemSolvedByUser');
          // Extract array from the "solvedProblems" key in JSON
          setSolvedProblems(resSolved.data.solvedProblems || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    
    // Tag logic: check if selected tag exists within the problem's tags array
    const tagMatch = filters.tag === 'all' || (problem.tags && problem.tags.includes(filters.tag));
    
    // Status logic: check if problem ID exists in solvedProblems list
    const isSolved = solvedProblems.some((sp) => sp._id === problem._id);
    const statusMatch = filters.status === 'all' || 
                        (filters.status === 'solved' && isSolved) || 
                        (filters.status === 'unsolved' && !isSolved);

    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-base-200">
      {/* --- Navigation Bar --- */}
      <nav className="navbar bg-base-100 shadow-md px-6 sticky top-0 z-50">
        <div className="flex-1">
          <NavLink to="/" className="text-2xl font-bold tracking-tighter text-primary">
            CODE<span className="text-base-content">LAB</span>
          </NavLink>
        </div>
        
        <div className="flex-none gap-2">
          {user ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                  <span>{user.firstName?.charAt(0)}</span>
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
                <li className="menu-title"><span>Hi, {user.firstName}</span></li>
                {user.role === 'admin' && (
                  <li><NavLink to="/admin" className="text-secondary font-semibold">Admin Dashboard</NavLink></li>
                )}
                <li><button onClick={handleLogout} className="text-error">Logout</button></li>
              </ul>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm">Login</NavLink>
          )}
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="container mx-auto p-6 max-w-6xl">
        
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Problemset</h1>
          <p className="text-base-content/60">Sharpen your coding skills with our curated challenges.</p>
        </header>

        {/* --- Filters Section --- */}
        <div className="flex flex-wrap gap-3 mb-8 bg-base-100 p-4 rounded-xl shadow-sm border border-base-300">
          <select 
            className="select select-bordered select-sm md:select-md"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>

          <select 
            className="select select-bordered select-sm md:select-md"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select 
            className="select select-bordered select-sm md:select-md"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="twoPointers">Two Pointers</option>
            <option value="graph">Graph</option>
            <option value="dp">Dynamic Programming</option>
          </select>
        </div>

        {/* --- Problems Table/List --- */}
        {loading ? (
          <div className="flex justify-center p-20"><span className="loading loading-dots loading-lg"></span></div>
        ) : (
          <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-300">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th className="w-16">Status</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => (
                    <tr key={problem._id} className="hover">
                      <td>
                        {solvedProblems.some(sp => sp._id === problem._id) ? (
                          <div className="text-success tooltip" data-tip="Solved">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="text-base-300">—</div>
                        )}
                      </td>
                      <td>
                        <NavLink to={`/problem/${problem._id}`} className="font-semibold hover:text-primary transition-colors">
                          {problem.title}
                        </NavLink>
                      </td>
                      <td>
                        <span className={`badge badge-sm font-bold p-3 ${getDifficultyBadgeColor(problem.difficulty)}`}>
                          {problem.difficulty.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {problem.tags?.map((tag, idx) => (
                            <span key={idx} className="badge badge-outline badge-xs opacity-70">{tag}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-base-content/50">
                      No problems match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-success/10 text-success border-success/20';
    case 'medium': return 'bg-warning/10 text-warning border-warning/20';
    case 'hard': return 'bg-error/10 text-error border-error/20';
    default: return 'badge-neutral';
  }
};

export default Homepage;