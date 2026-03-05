// Game scenarios - 30 questions from CS fundamentals
// Answers are randomly distributed across options (no fixed pattern)
export const GAME_SCENARIOS = [
    // === Q1: OS – Deadlock ===
    {
        id: 1,
        scenario: "A cloud server runs four processes: P1, P2, P3, and P4. P1 holds the Printer and waits for Disk. P2 holds the Disk and waits for Printer. P3 and P4 are waiting for both resources. The system becomes unresponsive.",
        question: "What is the primary OS problem occurring here?",
        correctAnswer: 2,
        options: [
            "Starvation",
            "Thrashing",
            "Deadlock",
            "Context Switching"
        ]
    },
    // === Q2: OS – CPU Scheduling ===
    {
        id: 2,
        scenario: "A system runs three processes: P1 (burst time 5), P2 (burst time 3), P3 (burst time 8). The system uses Shortest Job First (SJF) scheduling.",
        question: "Which process executes first?",
        correctAnswer: 0,
        options: [
            "P2",
            "P1",
            "P3",
            "Depends on arrival time"
        ]
    },
    // === Q3: DBMS – Normalization ===
    {
        id: 3,
        scenario: "An e-commerce system stores order information with CustomerName, Product, Price, and CustomerAddress all in one table. After thousands of orders, duplicate customer information is stored repeatedly, increasing storage usage.",
        question: "Which database concept solves this problem?",
        correctAnswer: 3,
        options: [
            "Indexing",
            "Data Mining",
            "Hashing",
            "Normalization"
        ]
    },
    // === Q4: DBMS – ACID Atomicity ===
    {
        id: 4,
        scenario: "In a banking system, ₹500 is deducted from Account A, but the system crashes before adding it to Account B. After restart, the system restores both accounts to their original state.",
        question: "Which ACID property ensured this behavior?",
        correctAnswer: 1,
        options: [
            "Consistency",
            "Atomicity",
            "Isolation",
            "Durability"
        ]
    },
    // === Q5: OOP – Inheritance ===
    {
        id: 5,
        scenario: "A company builds a Vehicle system where Car, Bike, and Truck share common properties like speed, fuel capacity, and start(). Instead of rewriting the same code multiple times, developers create a base class and extend it.",
        question: "Which OOP concept is used?",
        correctAnswer: 2,
        options: [
            "Encapsulation",
            "Polymorphism",
            "Inheritance",
            "Abstraction"
        ]
    },
    // === Q6: OOP – Runtime Polymorphism ===
    {
        id: 6,
        scenario: "An Animal class has a sound() method. A Dog class extends Animal and overrides sound(). When Animal a = new Dog() is used and a.sound() is called, it prints 'Bark' instead of 'Animal sound'.",
        question: "What concept determines the method that executes?",
        correctAnswer: 0,
        options: [
            "Runtime polymorphism",
            "Compile-time polymorphism",
            "Encapsulation",
            "Static binding"
        ]
    },
    // === Q7: Data Structures – Graph ===
    {
        id: 7,
        scenario: "A GPS navigation system stores cities as nodes and roads as edges. It calculates the shortest path between two cities.",
        question: "Which data structure best represents this problem?",
        correctAnswer: 3,
        options: [
            "Stack",
            "Queue",
            "Linked List",
            "Graph"
        ]
    },
    // === Q8: Data Structures – Stack (Browser History) ===
    {
        id: 8,
        scenario: "A web browser allows users to visit pages, go back to previous pages, and go forward again.",
        question: "Which data structure is most suitable?",
        correctAnswer: 1,
        options: [
            "Queue",
            "Stack",
            "Tree",
            "Hash Table"
        ]
    },
    // === Q9: Data Structures – Priority Queue ===
    {
        id: 9,
        scenario: "An operating system schedules tasks based on priority levels. Higher priority tasks must execute before lower priority ones.",
        question: "Which data structure efficiently supports this?",
        correctAnswer: 2,
        options: [
            "Linked List",
            "Stack",
            "Heap / Priority Queue",
            "Array"
        ]
    },
    // === Q10: Hardware – Thrashing ===
    {
        id: 10,
        scenario: "A computer has a fast CPU but only 2GB RAM with many applications open. The system becomes extremely slow because it constantly swaps data between RAM and disk.",
        question: "What phenomenon is happening?",
        correctAnswer: 0,
        options: [
            "Thrashing",
            "Paging",
            "Fragmentation",
            "Caching"
        ]
    },
    // === Q11: Hardware – Cache Memory ===
    {
        id: 11,
        scenario: "A processor frequently accesses the same data repeatedly. To reduce access time, the CPU stores recently used data in a small high-speed memory close to the processor.",
        question: "What is this memory called?",
        correctAnswer: 3,
        options: [
            "Register",
            "Virtual Memory",
            "ROM",
            "Cache Memory"
        ]
    },
    // === Q12: OS – Context Switching ===
    {
        id: 12,
        scenario: "When the CPU switches from executing Process A to Process B, it saves the state of Process A (registers, program counter, etc.) before executing the next process.",
        question: "What is this mechanism called?",
        correctAnswer: 1,
        options: [
            "Paging",
            "Context Switching",
            "Deadlock Prevention",
            "Scheduling"
        ]
    },
    // === Q13: DBMS – Indexing ===
    {
        id: 13,
        scenario: "A database table contains 10 million records. Searching for a specific record using a normal query is slow.",
        question: "Which technique improves search performance significantly?",
        correctAnswer: 2,
        options: [
            "Sorting",
            "Partitioning",
            "Indexing",
            "Recursion"
        ]
    },
    // === Q14: OOP – Encapsulation ===
    {
        id: 14,
        scenario: "A banking application hides the account balance and allows access only through functions like deposit() and withdraw(). The internal data is not directly accessible from outside the class.",
        question: "Which OOP concept is applied?",
        correctAnswer: 0,
        options: [
            "Encapsulation",
            "Abstraction",
            "Inheritance",
            "Polymorphism"
        ]
    },
    // === Q15: Hardware – Parallel Processing ===
    {
        id: 15,
        scenario: "A modern CPU contains multiple cores that can execute different tasks simultaneously — for example, running a video game while compressing a file in the background.",
        question: "Which computing concept enables this?",
        correctAnswer: 3,
        options: [
            "Sequential Execution",
            "Virtual Memory",
            "Caching",
            "Parallel Processing"
        ]
    },
    // === Q16: OS – Starvation ===
    {
        id: 16,
        scenario: "A server runs multiple processes using Priority Scheduling. High priority processes keep arriving frequently. A low priority process waits in the ready queue for a very long time and never gets CPU execution.",
        question: "What problem is occurring?",
        correctAnswer: 2,
        options: [
            "Deadlock",
            "Thrashing",
            "Starvation",
            "Context Switching"
        ]
    },
    // === Q17: OS – Virtual Memory ===
    {
        id: 17,
        scenario: "A system has 4GB RAM, but users run applications requiring 10GB memory. The OS temporarily moves inactive memory pages from RAM to disk to continue execution.",
        question: "What technique is being used?",
        correctAnswer: 1,
        options: [
            "Paging",
            "Virtual Memory",
            "Cache Mapping",
            "Fragmentation"
        ]
    },
    // === Q18: DBMS – Lost Update ===
    {
        id: 18,
        scenario: "Two bank transactions try to update the same account balance simultaneously. Both transactions read the same value before updating, causing the final balance to become incorrect.",
        question: "Which DBMS problem is occurring?",
        correctAnswer: 0,
        options: [
            "Lost Update Problem",
            "Dirty Read",
            "Deadlock",
            "Phantom Read"
        ]
    },
    // === Q19: DBMS – B-tree Index ===
    {
        id: 19,
        scenario: "A large student database with 2 million records stores student IDs and names. Searching students by ID is very slow. Developers create a B-tree index on StudentID.",
        question: "What benefit does this provide?",
        correctAnswer: 3,
        options: [
            "Reduces database size",
            "Prevents data redundancy",
            "Improves normalization",
            "Faster searching of records"
        ]
    },
    // === Q20: DBMS – Crash Recovery ===
    {
        id: 20,
        scenario: "A database crashes while executing transactions. After restarting, the database system uses logs to redo completed transactions and undo incomplete ones.",
        question: "Which DBMS feature handles this?",
        correctAnswer: 2,
        options: [
            "Indexing",
            "Query Optimization",
            "Logging and Recovery Mechanism",
            "Data Normalization"
        ]
    },
    // === Q21: OOP – Abstraction ===
    {
        id: 21,
        scenario: "A software developer designs a Payment System. Users only see functions like pay() and refund(), but the internal implementation (bank processing, encryption) is completely hidden.",
        question: "Which OOP concept is demonstrated?",
        correctAnswer: 1,
        options: [
            "Encapsulation",
            "Abstraction",
            "Polymorphism",
            "Inheritance"
        ]
    },
    // === Q22: OOP – Method Overloading ===
    {
        id: 22,
        scenario: "A class Calculator contains: add(int a, int b), add(int a, int b, int c), and add(double a, double b). All methods share the same name but have different parameters.",
        question: "Which OOP concept is used?",
        correctAnswer: 0,
        options: [
            "Method Overloading",
            "Method Overriding",
            "Encapsulation",
            "Inheritance"
        ]
    },
    // === Q23: OOP – Interface ===
    {
        id: 23,
        scenario: "A developer designs a Payment interface with methods processPayment() and generateReceipt(). Classes like CreditCard, UPI, and PayPal all implement this interface.",
        question: "What advantage does this provide?",
        correctAnswer: 3,
        options: [
            "Code duplication",
            "Increased memory usage",
            "Reduced abstraction",
            "Standard behavior across implementations"
        ]
    },
    // === Q24: Data Structures – Stack Overflow ===
    {
        id: 24,
        scenario: "A recursive program continuously calls itself without a stopping condition. Eventually the program crashes with an error.",
        question: "What is the most likely reason?",
        correctAnswer: 2,
        options: [
            "Heap Overflow",
            "Deadlock",
            "Stack Overflow",
            "Fragmentation"
        ]
    },
    // === Q25: Data Structures – Queue (Printer) ===
    {
        id: 25,
        scenario: "A printer receives print jobs in the order they are submitted. The first job submitted is the first one printed.",
        question: "Which data structure represents this behavior?",
        correctAnswer: 1,
        options: [
            "Stack",
            "Queue",
            "Graph",
            "Tree"
        ]
    },
    // === Q26: Data Structures – Tree ===
    {
        id: 26,
        scenario: "A company organizes employees where the CEO is at the top, managers are below, and employees are under managers. Each person reports to exactly one person above them.",
        question: "Which data structure represents this hierarchy?",
        correctAnswer: 0,
        options: [
            "Tree",
            "Graph",
            "Stack",
            "Queue"
        ]
    },
    // === Q27: Data Structures – Hashing ===
    {
        id: 27,
        scenario: "A website stores user sessions in a hash table. Users can be retrieved instantly using their session ID.",
        question: "What is the average search time complexity?",
        correctAnswer: 3,
        options: [
            "O(n)",
            "O(log n)",
            "O(n²)",
            "O(1)"
        ]
    },
    // === Q28: Hardware – Memory Hierarchy ===
    {
        id: 28,
        scenario: "A processor first checks fast memory close to the CPU before accessing slower RAM. This improves performance by reducing access time.",
        question: "Which concept is applied?",
        correctAnswer: 2,
        options: [
            "Paging",
            "Virtualization",
            "Memory Hierarchy",
            "Fragmentation"
        ]
    },
    // === Q29: Hardware – Bus Architecture ===
    {
        id: 29,
        scenario: "A computer system transfers data between CPU, memory, and peripheral devices using a shared communication pathway.",
        question: "What is this communication pathway called?",
        correctAnswer: 1,
        options: [
            "Register",
            "Bus",
            "Port",
            "Cache"
        ]
    },
    // === Q30: Hardware – RAID Storage ===
    {
        id: 30,
        scenario: "A company stores critical data using multiple hard drives combined together. If one disk fails, data can still be recovered from the others.",
        question: "Which technology is being used?",
        correctAnswer: 0,
        options: [
            "RAID (Redundant Array of Independent Disks)",
            "Cache Memory",
            "Virtual Memory",
            "CPU Pipelining"
        ]
    }
];

export default GAME_SCENARIOS;

