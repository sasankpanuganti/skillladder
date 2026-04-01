import React, { useMemo, useState } from "react";

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

const CURRICULUM = [
  {
    id: "c",
    name: "C",
    icon: "🧩",
    description: "Core programming, pointers, memory, and DSA foundations.",
    sections: [
      {
        id: "c-basics",
        title: "Basics",
        summary: "Syntax, variables, data types, input/output.",
        links: [
          { title: "C Tutorial (W3Schools)", href: "https://www.w3schools.com/c/" },
          { title: "C Programming (JavaTpoint)", href: "https://www.javatpoint.com/c-programming-language-tutorial" },
          { title: "C Data Types (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/c-data-types/" }
        ],
        quiz: {
          questions: [
            {
              id: "c-q1",
              prompt: "Which of the following is a valid C data type?",
              options: ["string", "int", "boolean", "list"],
              answerIndex: 1
            },
            {
              id: "c-q2",
              prompt: "What does `printf` do?",
              options: ["Reads input", "Prints formatted output", "Allocates memory", "Compiles code"],
              answerIndex: 1
            },
            {
              id: "c-q3",
              prompt: "In C, the entry point of a program is usually:",
              options: ["start()", "main()", "run()", "init()"],
              answerIndex: 1
            }
          ]
        }
      },
      {
        id: "c-control-flow",
        title: "Control Flow",
        summary: "Conditions and loops: if/else, switch, for/while.",
        links: [
          { title: "C If...Else (W3Schools)", href: "https://www.w3schools.com/c/c_conditions.php" },
          { title: "Loops in C (W3Schools)", href: "https://www.w3schools.com/c/c_loops.php" },
          { title: "switch Statement in C (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/switch-statement-cc/" }
        ],
        quiz: {
          questions: [
            {
              id: "c-cf1",
              prompt: "Which loop is best when you know the number of iterations?",
              options: ["for", "while", "do...while", "switch"],
              answerIndex: 0
            },
            {
              id: "c-cf2",
              prompt: "What keyword exits a loop early?",
              options: ["skip", "exit", "break", "stop"],
              answerIndex: 2
            }
          ]
        }
      },
      {
        id: "c-pointers",
        title: "Pointers & Memory",
        summary: "Addresses, dereferencing, arrays, and basic memory model.",
        links: [
          {
            title: "Pointers in C (GeeksforGeeks)",
            href: "https://www.geeksforgeeks.org/pointers-in-c-and-c-set-1-introduction-arithmetic-and-array/"
          },
          { title: "Arrays in C (W3Schools)", href: "https://www.w3schools.com/c/c_arrays.php" },
          { title: "Dynamic Memory Allocation (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/dynamic-memory-allocation-in-c-using-malloc-calloc-free-and-realloc/" }
        ],
        quiz: {
          questions: [
            {
              id: "c-p1",
              prompt: "A pointer stores:",
              options: ["A value", "A memory address", "A function", "A file"],
              answerIndex: 1
            },
            {
              id: "c-p2",
              prompt: "Which operator is used to dereference a pointer in C?",
              options: ["&", "*", "#", "@"],
              answerIndex: 1
            }
          ]
        }
      }
    ]
  },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    description: "OOP, collections, multithreading, and backend foundations.",
    sections: [
      {
        id: "java-basics",
        title: "Basics",
        summary: "Syntax, variables, types, input/output, operators.",
        links: [
          { title: "Java Tutorial (W3Schools)", href: "https://www.w3schools.com/java/" },
          { title: "Java Tutorial (JavaTpoint)", href: "https://www.javatpoint.com/java-tutorial" },
          { title: "Java (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/java/" }
        ],
        quiz: {
          questions: [
            {
              id: "java-q1",
              prompt: "Which keyword is used to create a class in Java?",
              options: ["class", "struct", "object", "type"],
              answerIndex: 0
            },
            {
              id: "java-q2",
              prompt: "Which method is the entry point of a Java program?",
              options: ["main()", "start()", "run()", "init()"],
              answerIndex: 0
            }
          ]
        }
      },
      {
        id: "java-oop",
        title: "OOP",
        summary: "Classes, objects, inheritance, polymorphism, encapsulation.",
        links: [
          { title: "OOP Concepts (JavaTpoint)", href: "https://www.javatpoint.com/java-oops-concepts" },
          { title: "Inheritance in Java (W3Schools)", href: "https://www.w3schools.com/java/java_inheritance.asp" },
          { title: "Polymorphism in Java (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/polymorphism-in-java/" }
        ],
        quiz: {
          questions: [
            {
              id: "java-o1",
              prompt: "Encapsulation is mainly about:",
              options: ["Hiding data with access control", "Multiple inheritance", "Faster execution", "File I/O"],
              answerIndex: 0
            },
            {
              id: "java-o2",
              prompt: "Method overriding happens when:",
              options: [
                "Same method name, different parameters (same class)",
                "Subclass defines a method with same signature",
                "Two classes have different method names",
                "A method returns void"
              ],
              answerIndex: 1
            },
            {
              id: "java-o3",
              prompt: "Which keyword prevents a method from being overridden?",
              options: ["static", "private", "final", "public"],
              answerIndex: 2
            }
          ]
        }
      },
      {
        id: "java-collections",
        title: "Collections",
        summary: "List, Set, Map and when to use each.",
        links: [
          { title: "Collections in Java (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/collections-in-java-2/" },
          { title: "ArrayList (W3Schools)", href: "https://www.w3schools.com/java/java_arraylist.asp" },
          { title: "HashMap (W3Schools)", href: "https://www.w3schools.com/java/java_hashmap.asp" }
        ],
        quiz: {
          questions: [
            {
              id: "java-col1",
              prompt: "Which structure stores key-value pairs?",
              options: ["List", "Set", "Map", "Queue"],
              answerIndex: 2
            },
            {
              id: "java-col2",
              prompt: "A Set typically:",
              options: ["Allows duplicates", "Preserves insertion order always", "Contains unique elements", "Only stores numbers"],
              answerIndex: 2
            }
          ]
        }
      }
    ]
  },
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    description: "Fast to learn, great for scripting, backend, data, and AI.",
    sections: [
      {
        id: "py-basics",
        title: "Basics",
        summary: "Syntax, variables, types, printing, input.",
        links: [
          { title: "Python Tutorial (W3Schools)", href: "https://www.w3schools.com/python/" },
          { title: "Python Tutorial (JavaTpoint)", href: "https://www.javatpoint.com/python-tutorial" },
          { title: "Python (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/python-programming-language-tutorial/" }
        ],
        quiz: {
          questions: [
            {
              id: "py-q1",
              prompt: "Which symbol starts a comment in Python?",
              options: ["//", "#", "/*", "--"],
              answerIndex: 1
            },
            {
              id: "py-q2",
              prompt: "What is the output type of `len([1,2,3])`?",
              options: ["int", "str", "list", "bool"],
              answerIndex: 0
            }
          ]
        }
      },
      {
        id: "py-control-flow",
        title: "Control Flow",
        summary: "if/elif/else, loops, range, break/continue.",
        links: [
          { title: "Python If...Else (W3Schools)", href: "https://www.w3schools.com/python/python_conditions.asp" },
          { title: "Python While Loops (W3Schools)", href: "https://www.w3schools.com/python/python_while_loops.asp" },
          { title: "Python For Loops (W3Schools)", href: "https://www.w3schools.com/python/python_for_loops.asp" }
        ],
        quiz: {
          questions: [
            {
              id: "py-cf1",
              prompt: "Which keyword skips to the next loop iteration?",
              options: ["break", "continue", "pass", "skip"],
              answerIndex: 1
            },
            {
              id: "py-cf2",
              prompt: "What does `range(3)` produce?",
              options: ["[0,1,2,3]", "[1,2,3]", "0,1,2", "0,1,2,3"],
              answerIndex: 2
            },
            {
              id: "py-cf3",
              prompt: "In Python, indentation is used to:",
              options: ["Add comments", "Define code blocks", "Import modules", "Declare types"],
              answerIndex: 1
            }
          ]
        }
      },
      {
        id: "py-functions",
        title: "Functions",
        summary: "def, parameters, return, scope.",
        links: [
          { title: "Python Functions (W3Schools)", href: "https://www.w3schools.com/python/python_functions.asp" },
          { title: "Python Functions (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/python-functions/" },
          { title: "Python Scope (W3Schools)", href: "https://www.w3schools.com/python/python_scope.asp" }
        ],
        quiz: {
          questions: [
            {
              id: "py-f1",
              prompt: "What keyword defines a function in Python?",
              options: ["func", "def", "function", "lambda"],
              answerIndex: 1
            },
            {
              id: "py-f2",
              prompt: "A function returns a value using:",
              options: ["yield", "print", "return", "out"],
              answerIndex: 2
            }
          ]
        }
      }
    ]
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "📜",
    description: "The language of the web: DOM, async, frameworks.",
    sections: [
      {
        id: "js-basics",
        title: "Basics",
        summary: "Variables, types, operators, functions.",
        links: [
          { title: "JavaScript Tutorial (W3Schools)", href: "https://www.w3schools.com/js/" },
          { title: "JavaScript Tutorial (JavaTpoint)", href: "https://www.javatpoint.com/javascript-tutorial" },
          { title: "JavaScript (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/javascript/" }
        ],
        quiz: {
          questions: [
            {
              id: "js-q1",
              prompt: "Which keyword declares a block-scoped variable?",
              options: ["var", "let", "define", "int"],
              answerIndex: 1
            },
            {
              id: "js-q2",
              prompt: "`===` checks:",
              options: ["Value only", "Type only", "Value and type", "Neither"],
              answerIndex: 2
            }
          ]
        }
      },
      {
        id: "js-dom",
        title: "DOM & Events",
        summary: "Select elements, handle clicks, update the page.",
        links: [
          { title: "DOM (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/dom-document-object-model/" },
          { title: "HTML DOM (W3Schools)", href: "https://www.w3schools.com/js/js_htmldom.asp" },
          { title: "JavaScript Events (W3Schools)", href: "https://www.w3schools.com/js/js_events.asp" }
        ],
        quiz: {
          questions: [
            {
              id: "js-dom1",
              prompt: "Which method selects a single element by CSS selector?",
              options: ["querySelector", "getElementsByClassName", "selectOne", "pick"],
              answerIndex: 0
            },
            {
              id: "js-dom2",
              prompt: "An event listener is used to:",
              options: ["Compile code", "React to user actions", "Create variables", "Sort arrays"],
              answerIndex: 1
            },
            {
              id: "js-dom3",
              prompt: "Which event fires on a button click?",
              options: ["hover", "press", "click", "tap"],
              answerIndex: 2
            }
          ]
        }
      },
      {
        id: "js-async",
        title: "Async JavaScript",
        summary: "Promises, async/await, fetch APIs.",
        links: [
          { title: "Promises (W3Schools)", href: "https://www.w3schools.com/js/js_promise.asp" },
          { title: "Async/Await (JavaTpoint)", href: "https://www.javatpoint.com/javascript-async-await" },
          { title: "Fetch API (MDN)", href: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" }
        ],
        quiz: {
          questions: [
            {
              id: "js-a1",
              prompt: "Which keyword makes a function return a Promise implicitly?",
              options: ["promise", "await", "async", "defer"],
              answerIndex: 2
            },
            {
              id: "js-a2",
              prompt: "`await` can be used inside:",
              options: ["Any function", "Only async functions", "Only classes", "Only loops"],
              answerIndex: 1
            }
          ]
        }
      }
    ]
  },
  {
    id: "cpp",
    name: "C++",
    icon: "⚡",
    description: "High-performance programming, OOP, STL, competitive coding.",
    sections: [
      {
        id: "cpp-basics",
        title: "Basics",
        summary: "Syntax, variables, I/O, functions.",
        links: [
          { title: "C++ Tutorial (W3Schools)", href: "https://www.w3schools.com/cpp/" },
          { title: "C++ Tutorial (JavaTpoint)", href: "https://www.javatpoint.com/cpp-tutorial" },
          { title: "C++ (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/c-plus-plus/" }
        ],
        quiz: {
          questions: [
            {
              id: "cpp-q1",
              prompt: "Which header is commonly used for standard I/O streams in C++?",
              options: ["<stdio.h>", "<iostream>", "<stream>", "<io>"],
              answerIndex: 1
            },
            {
              id: "cpp-q2",
              prompt: "`std::vector` is part of:",
              options: ["STL", "JDK", "CLR", "DOM"],
              answerIndex: 0
            }
          ]
        }
      },
      {
        id: "cpp-oop",
        title: "OOP",
        summary: "Classes, constructors, inheritance, polymorphism.",
        links: [
          { title: "OOP Concepts (JavaTpoint)", href: "https://www.javatpoint.com/cpp-oops-concepts" },
          { title: "Classes (W3Schools)", href: "https://www.w3schools.com/cpp/cpp_classes.asp" },
          { title: "Virtual Functions (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/virtual-function-cpp/" }
        ],
        quiz: {
          questions: [
            {
              id: "cpp-o1",
              prompt: "A constructor is called when:",
              options: ["An object is destroyed", "An object is created", "A loop runs", "A file is opened"],
              answerIndex: 1
            },
            {
              id: "cpp-o2",
              prompt: "Which keyword enables runtime polymorphism for methods?",
              options: ["virtual", "static", "const", "mutable"],
              answerIndex: 0
            },
            {
              id: "cpp-o3",
              prompt: "STL stands for:",
              options: ["Standard Type Library", "System Template List", "Standard Template Library", "Static Template Link"],
              answerIndex: 2
            }
          ]
        }
      },
      {
        id: "cpp-stl",
        title: "STL Essentials",
        summary: "vector, map, set, algorithms.",
        links: [
          { title: "STL (GeeksforGeeks)", href: "https://www.geeksforgeeks.org/the-c-standard-template-library-stl/" },
          { title: "vector (cppreference)", href: "https://en.cppreference.com/w/cpp/container/vector" },
          { title: "Algorithms (cppreference)", href: "https://en.cppreference.com/w/cpp/algorithm" }
        ],
        quiz: {
          questions: [
            {
              id: "cpp-s1",
              prompt: "Which container stores unique keys and is ordered?",
              options: ["vector", "set", "queue", "stack"],
              answerIndex: 1
            },
            {
              id: "cpp-s2",
              prompt: "Which header provides algorithms like sort?",
              options: ["<algorithm>", "<utility>", "<cmath>", "<chrono>"],
              answerIndex: 0
            }
          ]
        }
      }
    ]
  }
];

function Quiz({ quizId, questions, value, onChange }) {
  const answeredCount = questions.reduce((acc, q) => (typeof value?.[q.id] === "number" ? acc + 1 : acc), 0);
  const isComplete = answeredCount === questions.length;
  const score = questions.reduce((acc, q) => (value?.[q.id] === q.answerIndex ? acc + 1 : acc), 0);

  const pillClass = (kind) => {
    if (kind === "good") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/25";
    if (kind === "bad") return "bg-rose-500/15 text-rose-700 border-rose-500/25";
    return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  };

  return (
    <div className="mt-6 bg-white/35 border border-white/40 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold">
            Q
          </div>
          <div>
            <div className="font-bold text-gray-800">Quick Quiz</div>
            <div className="text-xs text-gray-600">Answer {questions.length} questions to test your understanding.</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${pillClass("neutral")}`}>
            {answeredCount}/{questions.length} answered
          </div>
          {isComplete && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                score === questions.length ? pillClass("good") : score === 0 ? pillClass("bad") : pillClass("neutral")
              }`}
            >
              Score: {score}/{questions.length}
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange({})}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-white/40 hover:bg-white/60 border border-white/50 text-gray-700 transition"
            aria-label={`Reset quiz ${quizId}`}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {questions.map((q, idx) => {
          const selected = value?.[q.id];
          return (
            <div key={q.id} className="bg-white/30 border border-white/40 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900/5 flex items-center justify-center text-sm font-bold text-slate-700">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{q.prompt}</div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected === oi;
                      const isCorrect = isComplete && oi === q.answerIndex;
                      const isWrongSelected = isComplete && isSelected && oi !== q.answerIndex;

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onChange({ ...(value || {}), [q.id]: oi })}
                          className={`text-left px-4 py-3 rounded-xl border transition-all ${
                            isSelected
                              ? "border-indigo-500/50 bg-indigo-500/10"
                              : "border-white/50 bg-white/25 hover:bg-white/40"
                          } ${isCorrect ? "ring-2 ring-emerald-400/40" : ""} ${isWrongSelected ? "ring-2 ring-rose-400/40" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-gray-800">{opt}</span>
                            {isCorrect && <span className="text-xs font-semibold text-emerald-700">Correct</span>}
                            {isWrongSelected && <span className="text-xs font-semibold text-rose-700">Wrong</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isComplete && (
                    <div className="mt-3 text-xs text-gray-600">
                      Correct answer: <span className="font-semibold">{q.options[q.answerIndex]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LearnTutorials() {
  const [activeLanguageId, setActiveLanguageId] = useState(CURRICULUM[0]?.id || "c");
  const [activeSectionId, setActiveSectionId] = useState(CURRICULUM[0]?.sections?.[0]?.id || "");
  const [query, setQuery] = useState("");
  const [completedSections, setCompletedSections] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});

  const activeLanguage = useMemo(
    () => CURRICULUM.find((l) => l.id === activeLanguageId) || CURRICULUM[0],
    [activeLanguageId]
  );

  const sections = activeLanguage?.sections || [];

  const activeSection = useMemo(() => {
    const found = sections.find((s) => s.id === activeSectionId);
    return found || sections[0];
  }, [sections, activeSectionId]);

  const totalSections = sections.length || 1;
  const doneCount = sections.reduce((acc, s) => (completedSections?.[s.id] ? acc + 1 : acc), 0);
  const progressPct = clamp(Math.round((doneCount / totalSections) * 100), 0, 100);

  const filteredLinks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const links = activeSection?.links || [];
    if (!q) return links;
    return links.filter((l) => l.title.toLowerCase().includes(q));
  }, [activeSection, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border border-white/50 text-xs font-semibold text-gray-700">
              <span className="text-base">📚</span>
              Tutorials + Quizzes
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mt-3">Learn</h1>
            <p className="text-gray-600 mt-2">
              Learn topic-wise like W3Schools/GFG and take short quizzes after each section.
            </p>
          </div>

          <div className="bg-white/35 backdrop-blur-xl border border-white/45 rounded-2xl p-4 shadow-xl w-full lg:w-[460px]">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
              <span>
                Progress: {doneCount}/{totalSections} sections
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200/70 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Tip: mark a section complete after finishing links + quiz.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Language + sections */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Languages</h2>
                <span className="text-xs text-gray-500">{CURRICULUM.length}</span>
              </div>

              <div className="space-y-2">
                {CURRICULUM.map((lang) => {
                  const isActive = lang.id === activeLanguageId;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        setActiveLanguageId(lang.id);
                        const firstSection = (lang.sections || [])[0]?.id || "";
                        setActiveSectionId(firstSection);
                        setQuery("");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 border border-blue-500/30"
                          : "text-gray-700 hover:bg-white/20"
                      }`}
                    >
                      <span className="text-xl">{lang.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{lang.name}</div>
                        <div className="text-xs text-gray-500">{lang.sections.length} sections</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Sections</h3>
                <span className="text-xs text-gray-500">{sections.length}</span>
              </div>

              <div className="space-y-2">
                {sections.map((s, idx) => {
                  const isActive = s.id === activeSectionId;
                  const isDone = !!completedSections?.[s.id];
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveSectionId(s.id);
                        setQuery("");
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/15 to-blue-500/10 text-indigo-800 border-indigo-500/25"
                          : "bg-white/15 hover:bg-white/25 border-white/40 text-gray-700"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                          isDone ? "bg-emerald-500/15 text-emerald-700" : "bg-slate-900/5 text-slate-700"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{s.title}</div>
                        <div className="text-xs text-gray-500">{s.summary}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right: Active section content */}
          <main className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div>
                  <div className="text-sm text-gray-600">
                    {activeLanguage?.name} / {activeSection?.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl">{activeLanguage?.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-800">{activeSection?.title}</h2>
                  </div>
                  <p className="text-gray-600 mt-2">{activeSection?.summary}</p>
                  <p className="text-xs text-gray-500 mt-2">{activeLanguage?.description}</p>
                </div>

                <div className="w-full md:w-96">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Search links in this section</label>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${activeSection?.title} links...`}
                    className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCompletedSections((prev) => ({ ...(prev || {}), [activeSection?.id]: true }))}
                      className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition"
                    >
                      Mark complete
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompletedSections((prev) => ({ ...(prev || {}), [activeSection?.id]: false }))}
                      className="px-4 py-2 rounded-xl font-semibold text-sm bg-white/35 hover:bg-white/55 border border-white/50 text-gray-700 transition"
                    >
                      Mark incomplete
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white/35 hover:bg-white/55 border border-white/40 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {link.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 break-all">{link.href}</div>
                      </div>
                      <div className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        Open ↗
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {filteredLinks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-3xl mb-2">🔎</div>
                  <div className="font-semibold text-gray-800">No links found</div>
                  <div className="text-gray-600 text-sm mt-1">Try a different search.</div>
                </div>
              )}

              <Quiz
                quizId={activeSection?.id}
                questions={activeSection?.quiz?.questions || []}
                value={quizAnswers?.[activeSection?.id] || {}}
                onChange={(next) =>
                  setQuizAnswers((prev) => ({ ...(prev || {}), [activeSection?.id]: next }))
                }
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

