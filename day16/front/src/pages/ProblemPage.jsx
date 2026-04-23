import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';

// Updated to match exactly the casing in your JSON 'language' fields
const langMap = {
  cpp: 'c++',
  java: 'java',
  javascript: 'javascript'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  const { problemId } = useParams();

  // Initial Fetch
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const data = response.data;
        
        setProblem(data);

        // Find initial code for the default language (javascript)
        const initialObj = data.startCode.find(sc => sc.language === langMap[selectedLanguage]);
        if (initialObj) {
          setCode(initialObj.initialCode);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Handle language switching
  useEffect(() => {
    if (problem && problem.startCode) {
      const langEntry = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]);
      if (langEntry) {
        setCode(langEntry.initialCode);
      }
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      setActiveRightTab('testcase');
    } catch (error) {
      setRunResult({ success: false, error: 'Internal server error', testCases: [] });
      setActiveRightTab('testcase');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Submission Error:', error);
      setActiveRightTab('result');
    } finally {
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    if (lang === 'cpp') return 'cpp';
    return lang; // 'java' and 'javascript' match Monaco's strings
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-base-100 overflow-hidden">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        <div className="tabs tabs-bordered bg-base-200 px-4">
          {['description', 'editorial', 'solutions', 'submissions', 'chatAI'].map((tab) => (
            <button 
              key={tab}
              className={`tab ${activeLeftTab === tab ? 'tab-active font-bold' : ''}`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <div className={`badge badge-outline font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty.toUpperCase()}
                    </div>
                    <div className="badge badge-primary badge-outline">{problem.tags}</div>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{problem.description}</p>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={example._id || index} className="bg-base-200 p-4 rounded-lg border border-base-300">
                          <h4 className="font-semibold mb-2 text-primary">Example {index + 1}:</h4>
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex gap-2">
                              <span className="font-bold opacity-70">Input:</span> 
                              <code className="bg-base-300 px-1 rounded">{example.input}</code>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-bold opacity-70">Output:</span> 
                              <code className="bg-base-300 px-1 rounded">{example.output}</code>
                            </div>
                            {example.explanation && (
                               <div className="mt-2 italic text-base-content/70">
                                 <strong>Explanation:</strong> {example.explanation}
                               </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
              )}

              {activeLeftTab === 'solutions' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Reference Solutions</h2>
                  {problem.referenceSolution?.length > 0 ? (
                    problem.referenceSolution.map((sol) => (
                      <div key={sol._id} className="border border-base-300 rounded-lg">
                        <div className="bg-base-200 px-4 py-2 font-mono text-sm border-b border-base-300">
                          {sol.language}
                        </div>
                        <pre className="p-4 bg-neutral text-neutral-content text-xs overflow-x-auto">
                          <code>{sol.completeCode}</code>
                        </pre>
                      </div>
                    ))
                  ) : (
                    <p className="text-base-content/50 italic">Solutions will be visible after a successful submission.</p>
                  )}
                </div>
              )}

              {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}
              {activeLeftTab === 'chatAI' && <ChatAi problem={problem} />}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col">
        <div className="tabs tabs-bordered bg-base-200 px-4">
          {['code', 'testcase', 'result'].map(tab => (
            <button 
              key={tab}
              className={`tab ${activeRightTab === tab ? 'tab-active font-bold' : ''}`}
              onClick={() => setActiveRightTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center p-2 bg-base-100 border-b border-base-300">
                <div className="flex gap-1">
                  {Object.keys(langMap).map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-xs ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  theme="vs-dark"
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 10 }
                  }}
                />
              </div>

              <div className="p-3 border-t border-base-300 flex justify-between bg-base-200">
                <button className="btn btn-sm btn-ghost" onClick={() => setActiveRightTab('testcase')}>Console</button>
                <div className="flex gap-2">
                  <button className={`btn btn-sm btn-outline ${loading ? 'loading' : ''}`} onClick={handleRun} disabled={loading}>Run</button>
                  <button className={`btn btn-sm btn-primary ${loading ? 'loading' : ''}`} onClick={handleSubmitCode} disabled={loading}>Submit</button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto">
                {/* Result Logic remains same but styled for your JSON structure */}
                {runResult ? (
                    <div className="space-y-4">
                        <h3 className={`text-lg font-bold ${runResult.success ? 'text-success' : 'text-error'}`}>
                            {runResult.success ? 'Accepted' : 'Failed'}
                        </h3>
                        {runResult.testCases?.map((tc, i) => (
                            <div key={i} className="collapse collapse-arrow bg-base-200 border border-base-300">
                                <input type="checkbox" defaultChecked /> 
                                <div className="collapse-title font-medium flex justify-between items-center">
                                    <span>Case {i + 1}</span>
                                    <span className={tc.status_id === 3 ? 'text-success' : 'text-error'}>
                                        {tc.status_id === 3 ? '✓' : '✗'}
                                    </span>
                                </div>
                                <div className="collapse-content text-xs font-mono space-y-2">
                                    <p><strong>Input:</strong> {tc.stdin}</p>
                                    <p><strong>Expected:</strong> {tc.expected_output}</p>
                                    <p><strong>Actual:</strong> {tc.stdout}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center mt-20 opacity-50">Run your code to see results</div>
                )}
            </div>
          )}

          {activeRightTab === 'result' && (
             <div className="flex-1 p-6">
                {submitResult ? (
                    <div className={`card bg-base-200 border ${submitResult.accepted ? 'border-success' : 'border-error'}`}>
                        <div className="card-body">
                            <h2 className="card-title">{submitResult.accepted ? '🎉 Accepted!' : '❌ Rejected'}</h2>
                            <div className="stats stats-vertical shadow bg-base-100 mt-4">
                                <div className="stat">
                                    <div className="stat-title">Passed Test Cases</div>
                                    <div className="stat-value text-sm">{submitResult.passedTestCases} / {submitResult.totalTestCases}</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-title">Runtime</div>
                                    <div className="stat-value text-sm text-secondary">{submitResult.runtime}s</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mt-20 opacity-50">Submit your solution to evaluate all test cases</div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;