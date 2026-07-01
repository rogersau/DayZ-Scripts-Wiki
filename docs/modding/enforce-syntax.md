# Enforce Script Language Reference

> Complete syntax reference for the Enforce Script language used by DayZ. Designed for both human modders and AI coding agents.

Enforce Script is the object-oriented scripting language powering the Enfusion engine in DayZ Standalone. It is similar to C# and C++ in syntax and semantics. This page documents the full language — types, keywords, control flow, memory management, and modding-specific features — based on the official [Bohemia Interactive Community Wiki](https://community.bistudio.com/wiki/DayZ:Enforce_Script_Syntax) reference.

## Quick Facts for AI Agents

| Property | Value |
|----------|-------|
| **File extension** | `.c` |
| **Paradigm** | Object-oriented (classes, inheritance, polymorphism) |
| **Memory management** | Manual + optional ARC (Automatic Reference Counting) via `Managed` |
| **Compilation** | Compiled by Enforce Script compiler at mod load |
| **Case-sensitive** | Yes |
| **Garbage collection** | None by default — `ref`/`autoptr` for strong references |
| **Inheritance** | Single inheritance via `extends` |
| **Modding support** | `modded` keyword for non-destructive class injection |
| **Templates** | Generic types similar to C++ templates |
| **Null safety** | Weak references auto-zeroed when using `Managed` |
| **Threading** | `thread` keyword for concurrent execution |

## Relation to Other Wiki Pages

- **[Script Layers](/script-layers/)** — Where Enforce Script files live (5-layer architecture)
- **[Scripts vs Config](/architecture/script-vs-config)** — How scripts relate to `config.cpp` data
- **[Mod Project Structure](/modding/mod-structure)** — How to organize a mod project
- **[Safe Modding Patterns](/modding/safe-patterns)** — Best practices for writing mod scripts
- **[Common APIs](/modding/common-apis)** — Key APIs used in DayZ scripts

---

## 1. Program Structure

Enforce Script consists of **classes** and **functions**. All executable code must be declared inside a function. Top-level imperative code (outside functions/classes) is a compile-time error.

```c
class MyClass
{
    void Hello()
    {
        Print("Hello World");   // ok — inside a method
    }
}

void Hello()
{
    Print("Hello World");       // ok — global function
}

Print("Hello World");           // ERROR — unexpected statement at file level
```

### File Organization

- One `.c` file can contain multiple classes and global functions.
- File names are not required to match class names.
- The compiler processes all `.c` files in the script directories.
- The [layer system](/script-layers/) determines compile order.

### Code Blocks and Scope

Code blocks are delimited by curly braces `{ }` and define a **scope**. Variables declared inside a scope are only accessible within it.

```c
void Hello()
{
    int x = 2;      // x lives in Hello's scope
}

void Hello2()
{
    int x = 23;     // Different x — unrelated to the first one
}
```

Nested scopes **re-declare** variables, they do not shadow:

```c
void World()
{
    int i = 5;

    for (int i = 0; i < 12; ++i)   // ERROR: multiple declaration of 'i'
    {
    }
}
```

> **Note:** Unlike C++, Enforce Script does not allow variable shadowing in nested scopes. Each variable name must be unique within its containing function scope.

```c
void Hello()
{
    if (true)
    {
        int x = 2;
    }
    else
    {
        int x = 23;     // ERROR: multiple declaration of 'x'
                        // Both branches share the parent scope
    }
}
```

To work around this, declare the variable above the `if`:

```c
void Hello()
{
    int x;
    if (true)
        x = 2;
    else
        x = 23;
}
```

---

## 2. Comments

```c
/*
    Multi-line
    comment
*/

void Test()
{
    Print("Hello");     // Single-line comment
}
```

---

## 3. Types

### 3.1 Primitive Types

| Type | Range | Default Value |
|------|-------|---------------|
| `int` | −2,147,483,648 to +2,147,483,647 | `0` |
| `float` | ±1.401298E−45 to ±3.402823E+38 | `0.0` |
| `bool` | `true` / `false` | `false` |
| `string` | N/A | `""` (empty) |
| `vector` | See `float` (3-component) | `"0 0 0"` |
| `void` | N/A | N/A (no value) |
| `typename` | Any class name | `null` |
| Class | Any class instance | `null` |

### 3.2 Strings

- Passed **by value** (like primitives).
- Concatenated with `+`.
- Initialised and destroyed automatically.
- Escape sequences: `\n`, `\r`, `\t`, `\\`, `\"`.

```c
void Method()
{
    string a = "Hello";
    string b = " world!";
    string c = a + b;       // "Hello world!"
    Print(c);
}
```

### 3.3 Vectors

- Passed **by value** (like primitives).
- Three float components, indexed with `[0]`, `[1]`, `[2]`.
- Initialised from a quoted string `"x y z"`.

```c
void Method()
{
    vector up = "0 1 0";    // y-up
    vector down;            // defaults to "0 0 0"

    down = up;
    down[1] = -1;           // now "0 -1 0"

    Print(up);              // <0, 1, 0>
    Print(down);            // <0, -1, 0>
}
```

#### Vector Common Operations

| Operation | Example |
|-----------|---------|
| Length | `vector.Distance(vector)` — static method |
| Normalize | `vector.Normalized()` |
| Dot product | `vector * vector` (multiply component-wise) |
| Cross product | `vector % vector` (cross product operator) |
| ToString | `vector.ToString()` — returns `"x y z"` |

### 3.4 Automatic Type Detection (`auto`)

The `auto` keyword infers the type at compile time from the initialiser:

```c
void Method()
{
    auto variable1 = 1;                 // int
    auto variable2 = 1.0;               // float
    auto variablePi = 3.14;             // float
    auto variableInst = new MyClass();  // MyClass
}
```

---

## 4. Variables

### 4.1 Declaration and Assignment

```c
void Test()
{
    // declare
    int a;

    // assign
    a = 5;

    // initialise (declare + assign)
    int b = 9;
}
```

### 4.2 Constants

Declared with `const` — read-only after compilation:

```c
const int MONTHS_COUNT = 12;

void Test()
{
    int a = MONTHS_COUNT;   // ok
    MONTHS_COUNT = 7;       // ERROR: constant is read-only
}
```

> Constants are resolved at compile time. They can be used as array sizes and in `switch` cases.

### 4.3 Variable Modifiers

| Modifier | Applies To | Description |
|----------|-----------|-------------|
| `private` | Class members | Accessible only within the same class |
| `protected` | Class members | Accessible within class and subclasses |
| `static` | Class members | Accessed via `ClassName.member`, no instance needed |
| `autoptr` | Class pointer | Auto-destroyed at end of scope |
| `ref` | Class pointer | Strong reference (increases ref count) |
| `const` | Any variable | Read-only after initialisation |
| `out` | Function parameter | Passed by reference, value can be changed |
| `inout` | Function parameter | Read and written by the function |

---

## 5. Operators

### 5.1 Arithmetic

| Operator | Operation |
|----------|-----------|
| `+` | Add |
| `-` | Subtract |
| `*` | Multiply |
| `/` | Divide |
| `%` | Modulo |

### 5.2 Assignment

| Operator | Operation |
|----------|-----------|
| `=` | Assign |
| `+=` | Increment by value |
| `-=` | Decrement by value |
| `*=` | Multiply by value |
| `/=` | Divide by value |
| `\|=` | Bitwise-OR by value |
| `&=` | Bitwise-AND by value |
| `<<=` | Left-shift by value |
| `>>=` | Right-shift by value |
| `++` | Increment by 1 |
| `--` | Decrement by 1 |

### 5.3 Relational

| Operator | Operation |
|----------|-----------|
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater or equal |
| `<=` | Less or equal |
| `==` | Equal |
| `!=` | Not equal |

### 5.4 Logical and Bitwise

| Category | Operators |
|----------|-----------|
| Logical | `&&`, `\|\|` |
| Bitwise | `&`, `\|`, `~`, `^` |
| Shift | `<<`, `>>` |
| Negation | `!` |
| String concat | `+` |
| Indexing | `[ ]` |

### 5.5 Operator Precedence

Follows C/C++ precedence rules. See the [C++ operator precedence table](https://en.wikipedia.org/wiki/Operators_in_C_and_C%2B%2B#Operator_precedence) for details.

### 5.6 Index Operator Overload

Overload `Set` and `Get` methods on a class:

```c
class IndexOperatorTest
{
    int data[3];

    void Set(int _index, int _value)
    {
        data[_index] = _value;
    }

    int Get(int _index)
    {
        return data[_index];
    }
}

void Test()
{
    auto instance = new IndexOperatorTest();
    instance[1] = 5;
    Print(instance[1]);     // prints '5'
}
```

> **Note:** If you need to parse a vector string like `"1 1 1"` via the index operator, the setter must accept `string` and call `_value.ToVector()` explicitly.

---

## 6. Functions

### 6.1 Function Declaration

Functions consist of a **return type**, **name**, and **parameter list**. They can be declared globally or as class members.

```c
void MethodA()                              // No parameters, no return
{
}

int GiveMeTen()                             // Returns int
{
    return 10;
}
```

### 6.2 Function Rules

- Parameters are **fixed and typed** — no variadic arguments.
- Functions can be **overloaded** (same name, different parameter types).
- Default parameter values are supported.
- The `out` keyword passes by reference (native functions only).
- Functions cannot be nested inside other functions.

```c
float Sum(float a, float b)     { return a + b; }
float Sum(int a, int b)         { return a + b; }       // overloaded

void PrintNum(int a = 0)                                // default parameter
{
    Print(a);
}
```

### 6.3 Out Parameters

```c
void GiveMeElevenAndTwelve(out int val1, out int val2, int val3)
{
    val1 = 11;
    val2 = 12;
    val3 = 13;      // val3 is NOT out — caller won't see this change
}

void Method()
{
    int eleven = 0;
    int twelve = 0;
    int thirteen = 0;

    GiveMeElevenAndTwelve(eleven, twelve, thirteen);

    Print(eleven);      // 11
    Print(twelve);      // 12
    Print(thirteen);    // 0 — unchanged!
}
```

### 6.4 Function Modifiers

| Modifier | Description |
|----------|-------------|
| `private` | Only callable within the same class |
| `protected` | Callable within class and subclasses |
| `static` | Callable without instance: `ClassName.Method()` |
| `override` | Must match a virtual method in the base class |
| `proto` | Prototyping of a native (C++) function |
| `native` | Native C++ call convention |

---

## 7. Control Structures

### 7.1 If / Else If / Else

```c
void Method()
{
    int a = 4;
    int b = 5;

    if (a > 0 && b > 0)
    {
        Print("Both are positive");
    }

    if (a > 10)
    {
        Print("a > 10");
    }
    else if (a > 5)
    {
        Print("a > 5 but <= 10");
    }
    else
    {
        Print("a <= 5");
    }
}
```

### 7.2 Switch

Supports switching on `int`, `const int`, and `string`:

```c
void Method()
{
    // Integer switch
    int a = 2;
    switch (a)
    {
        case 1:
            Print("a is 1");
            break;
        case 2:
            Print("a is 2");
            break;
        default:
            Print("something else");
            break;
    }

    // String switch
    string name = "peter";
    switch (name)
    {
        case "john":
            Print("Hello John!");
            break;
        case "peter":
            Print("Hello Peter!");
            break;
    }
}
```

### 7.3 For Loop

```c
void Method()
{
    for (int i = 0; i < 3; i++)
    {
        Print(i);       // 0, 1, 2
    }
}
```

### 7.4 Foreach Loop

Cleaner iteration over arrays and maps:

```c
void TestFn()
{
    int pole1[] = { 7, 3, 6, 8 };
    array<string> pole2 = { "a", "b", "c" };
    auto mapa = new map<string, int>();
    mapa["jan"] = 1;
    mapa["feb"] = 2;
    mapa["mar"] = 3;

    // Simple — iterates values
    foreach (int v : pole1) { }         // 7, 3, 6, 8

    // With index key
    foreach (int i, string j : pole2) { }  // pole[0]=a, pole[1]=b, pole[2]=c

    // Map — key and value
    foreach (auto k, auto a : mapa) { }    // mapa[jan]=1, ...

    // Map — values only
    foreach (auto b : mapa) { }            // 1, 2, 3
}
```

### 7.5 While Loop

```c
void Method()
{
    int i = 0;
    while (i < 3)
    {
        Print(i);       // 0, 1, 2
        i++;
    }
}
```

---

## 8. Object-Oriented Programming

### 8.1 Classes

- All members are **public by default**.
- Use `private` or `protected` to restrict access.
- Member functions are **virtual** by default and can be overridden.
- Use the `override` keyword explicitly (prevents accidental overriding).

```c
class MyClass
{
    void Hello()
    {
        Print("Hello");
    }
}
```

### 8.2 Inheritance

Single inheritance via `extends`:

```c
class AnimalClass
{
    void MakeSound()
    {
        Print("...");
    }
}

class Dog : AnimalClass
{
    override void MakeSound()
    {
        Print("Woof!");
    }
}

class Cat : AnimalClass
{
    override void MakeSound()
    {
        Print("Meow!");
    }
}
```

### 8.3 Polymorphism

```c
void LetAnimalMakeSound(AnimalClass pet)
{
    if (pet)
    {
        pet.MakeSound();    // Calls the actual type's method
    }
}

void Method()
{
    Cat nyan = new Cat;
    Dog pluto = new Dog;

    LetAnimalMakeSound(nyan);   // "Meow!"
    LetAnimalMakeSound(pluto);  // "Woof!"
}
```

### 8.4 `this` and `super`

```c
class AnimalClass
{
    void Hello() { Print("AnimalClass.Hello()"); }
}

class HoneyBadger : AnimalClass
{
    override void Hello() { Print("HoneyBadger.Hello()"); }

    void Test()
    {
        Hello();             // "HoneyBadger.Hello()"
        this.Hello();        // "HoneyBadger.Hello()"
        super.Hello();       // "AnimalClass.Hello()"
    }
}
```

### 8.5 Constructor and Destructor

- Constructor: same name as class, returns `void`, optional parameters.
- Destructor: same name with `~` prefix, no parameters, returns `void`.
- Called automatically on `new` / `delete` (or `autoptr` end-of-scope).

```c
class MyClassA
{
    void MyClassA()
    {
        Print("Created!");
    }

    void ~MyClassA()
    {
        Print("Destroyed!");
    }
}

class MyClassB
{
    string m_name;

    void MyClassB(string name)
    {
        m_name = name;
    }
}

void Method()
{
    MyClassA a = new MyClassA;          // "Created!"
    MyClassB b = new MyClassB("Test");  // constructor with arg

    delete b;                           // destructor called

}   // end of scope — 'a' is auto-destroyed via ARC
```

> Omit brackets on `new` when the constructor has no parameters: `new MyClassA` not `new MyClassA()`.

---

## 9. Memory Management

Enforce Script offers **three memory management models**, from most to least manual:

| Model | Keywords | Behavior |
|-------|----------|----------|
| Manual | `new` / `delete` | C++-style — you create and destroy |
| Auto-destroy | `autoptr` | Destroyed at end of scope |
| ARC (Managed) | `ref` + `Managed` | Reference-counted, auto-destroyed when last strong ref drops |

### 9.1 Manual (`new` / `delete`)

```c
void Method()
{
    MyClass o = new MyClass;
    o.Say();
    delete o;           // Must delete or memory leaks
}
```

> Without `autoptr` or `ref`, plain pointers are **weak references**. If the target is deleted, they dangle.

### 9.2 Auto-Pointer (`autoptr`)

```c
void Method()
{
    autoptr MyClass o = new MyClass;
    o.Say();
    // Automatically 'delete o;' when scope ends
}
```

### 9.3 Managed Classes and ARC

Inheriting from `Managed` enables **soft links** (weak pointers that auto-zero) and **reference counting**:

```c
// WITHOUT Managed — unsafe
class A
{
    void Hello() { Print("hello"); }
}

void TestA()
{
    A a1 = new A();
    A a2 = a1;
    delete a1;
    if (a2) a2.Hello();     // CRASH — a2 is dangling!
}

// WITH Managed — safe
class B : Managed
{
    void Hello() { Print("hello"); }
}

void TestB()
{
    B a1 = new B();
    B a2 = a1;
    delete a1;
    if (a2) a2.Hello();     // Safe — a2 is now NULL
}
```

### 9.4 Strong and Weak References

- **Strong reference** (`ref`): increases ref count, keeps object alive.
- **Weak reference** (no modifier): just points, does not keep alive.

```c
class Parent
{
    ref Child m_child;      // Strong — keeps child alive
}

class Child
{
    Parent m_parent;        // Weak — does not keep parent alive
}

void main()
{
    Parent a = new Parent();
    Child b = new Child();
    a.m_child = b;          // b now has 2 strong refs
    b.m_parent = a;         // a still has 1 strong ref (weak on Child side)
}
```

### 9.5 Best Practice: Single Strong Reference

> **Optimal usage:** Have exactly **one strong reference** per object, placed in the "owner" who creates it. This avoids cyclic references and ensures proper destruction order.

```c
class ExampleClass
{
    // Weak reference to object
    MyClassA m_A;

    // Strong reference to object
    ref MyClassA m_B;

    // Strong ref to dynamic array of weak refs
    ref array<MyClassA> m_C;

    // Strong ref to dynamic array of strong refs
    ref array<ref MyClassA> m_D;

    // Static array of strong refs
    ref MyClassA m_E[10];
}
```

### 9.6 Reference Lifetime Rules

| Context | Default Strength | Released When |
|---------|-----------------|---------------|
| Local variable | Strong | End of scope |
| Function argument | Strong | Function returns |
| Function return value | Strong | Caller's scope ends |
| Class member (no `ref`) | Weak | — |
| Class member (`ref`) | Strong | Owner destroyed |
| `autoptr` local | Strong (with auto-delete) | End of scope |

---

## 10. Enums

- Enums are `int`-typed named constants.
- Values auto-increment from the previous item (or start at 0).
- Can inherit from another enum (values continue from parent).
- Enum names used as types behave like plain `int`.

```c
enum MyEnumBase
{
    Alfa = 5,       // 5
    Beta,           // 6
    Gamma           // 7
}

enum MyEnum : MyEnumBase
{
    Blue,           // 8
    Yellow,         // 9
    Green = 20,     // 20
    Orange          // 21
}

void Test()
{
    int a = MyEnum.Beta;        // 6
    MyEnum b = MyEnum.Green;    // 20
}
```

---

## 11. Templates (Generics)

Enforce Script supports generic types similar to C++ templates.

```c
class Item<Class T>
{
    T m_Data;

    void Item(T data) { m_Data = data; }
    T GetData() { return m_Data; }
}

void Method()
{
    Item<string> stringItem = new Item<string>("Hello!");
    Item<int> intItem = new Item<int>(72);

    stringItem.GetData();   // "Hello!"
    intItem.GetData();      // 72
}
```

- Multiple generic type parameters are supported.
- Generic types are declared inside `<>` after the class name.

---

## 12. Arrays

### 12.1 Static Arrays

- Indexed from 0.
- Passed **by reference**.
- Size must be a compile-time constant.
- Initialised and destroyed automatically.

```c
void Method()
{
    int numbersArray[3];                    // size 3
    numbersArray[0] = 54;
    numbersArray[1] = 82;
    numbersArray[2] = 7;

    int anotherArray[3] = {53, 90, 7};      // inline initialisation

    int size = 3;
    int badArray[size];                     // ERROR: size must be constant
}
```

### 12.2 Dynamic Arrays (`array<T>`)

- Size changes at runtime via `Insert` / `Remove`.
- Provided through the `array<T>` template class.
- Passed **by reference**.
- Are **objects** — must be created with `new` and managed.

#### Common Typedefs

| Typedef | Actual Type |
|---------|-------------|
| `TStringArray` | `array<string>` |
| `TFloatArray` | `array<float>` |
| `TIntArray` | `array<int>` |
| `TClassArray` | `array<class>` |
| `TVectorArray` | `array<vector>` |

```c
void Method()
{
    autoptr TStringArray nameArray = new TStringArray;

    nameArray.Insert("Peter");
    nameArray.Insert("Michal");

    string name = nameArray.Get(1);     // "Michal"
    nameArray.Remove(1);                // remove second element

    int count = nameArray.Count();      // 1
}
```

> **Important:** Dynamic arrays are objects — use `autoptr` or manage them manually to avoid memory leaks.

---

## 13. Typedef

```c
typedef float MyFloat;          // Now 'MyFloat' is an alias for 'float'

void Test()
{
    MyFloat x = 3.14;
}
```

---

## 14. Modding Features

### 14.1 `modded` Class

The `modded` keyword is a special DayZ feature for **non-destructive class injection**:

- Behaves like inheritance from the original class.
- When `modded` is declared, it replaces the original class everywhere in script.
- Multiple `modded` classes form a chain — each inherits from the previous mod.

```c
// Original game class
class ModMe
{
    void Say() { Print("Hello original"); }
}

// First mod
modded class ModMe
{
    override void Say()
    {
        Print("Hello modded One");
        super.Say();
    }
}

// Second mod — inherits from the first mod's ModMe
modded class ModMe
{
    override void Say()
    {
        Print("Hello modded Two");
        super.Say();
    }
}

void Test()
{
    ModMe a = new ModMe();
    a.Say();
    // Prints:
    //   "Hello modded Two"
    //   "Hello modded One"
    //   "Hello original"
}
```

### 14.2 Modded Constants

Constants can be overridden by the last loaded mod (mod load order matters):

```c
class BaseTest
{
    const int CONST_BASE = 4;
}

class TestConst : BaseTest
{
    const int CONST_TEST = 5;
}

modded class TestConst
{
    const int CONST_BASE = 1;
    const int CONST_TEST = 2;
    const int CONST_MOD = 3;
}

void TestPrint()
{
    Print(TestConst.CONST_BASE);    // 1
    Print(TestConst.CONST_TEST);    // 2
    Print(TestConst.CONST_MOD);     // 3
}
```

### 14.3 Modded Private Access

> Even though a `modded` class behaves like an inherited one, it **can access private members** of the vanilla class. This is intentional for mod compatibility.

```c
// Original
class VanillaClass
{
    private bool imPrivate = false;
    private void DoSomething() { Print("Vanilla method"); }
}

// Access private members
modded class VanillaClass
{
    void AccessPvt()
    {
        Print(imPrivate);       // Allowed!
        DoSomething();          // Allowed!
    }
}

// Override private methods
modded class VanillaClass
{
    override void DoSomething()
    {
        super.DoSomething();
        Print("Modded method");
    }
}
```

---

## 15. Threading

The `thread` keyword runs a function on a new thread:

```c
void ExpensiveOperation()
{
    // Long-running work here
}

void Method()
{
    thread ExpensiveOperation();    // Runs on a separate thread
}
```

> Use threading carefully — DayZ is not fully thread-safe. Avoid accessing game state from threads without proper synchronisation.

---

## 16. Common Built-in Types

### 16.1 `map<K, V>`

```c
void Test()
{
    auto scores = new map<string, int>();
    scores["player1"] = 100;
    scores["player2"] = 200;

    foreach (auto name, auto score : scores)
    {
        Print(name + " = " + score);
    }
}
```

### 16.2 `ref array<T>` Patterns

```c
class Inventory
{
    // Strong ref to array of weak item refs
    ref array<EntityAI> m_Items;

    // Strong ref to array of strong item refs
    ref array<ref EntityAI> m_StrongItems;

    // Weak ref to array of weak item refs (rare, needs owner management)
    array<EntityAI> m_WeakItems;
}
```

---

## 17. Preprocessor Directives

The Enforce Script preprocessor works similarly to C/C++ preprocessors, processing directives before compilation.

### 17.1 `#define` and `#undef`

```c
#define MY_CONSTANT 42
#define DEBUG_MODE

void Test()
{
    int x = MY_CONSTANT;    // replaced with 42 at compile time
}

#undef MY_CONSTANT          // removes the definition
```

> Unlike `const` variables, `#define` constants are textual substitutions. They have no type and are not scoped — use `const` for typed, scoped constants when possible.

### 17.2 Conditional Compilation: `#ifdef` / `#ifndef` / `#else` / `#endif`

This is critical for DayZ modding to separate server-only and client-only code:

```c
#ifdef SERVER
// This block only compiles on the server
void SavePlayerData()
{
    HiveRequest req = new HiveRequest();
    req.Write(GetGame().GetPlayer().GetIdentity().GetPlainName());
    req.Write(GetGame().GetTime());
}
#endif

#ifndef SERVER
// This block compiles on client AND Workbench (without -server flag)
void ShowClientUI()
{
    GetGame().GetUIManager().ShowHUD(true);
}
#endif
```

### 17.3 `#if` with Expressions

```c
#if VERSION > 100
// Compiles only for versions above 100
void NewFeature() { }
#else
void LegacyFeature() { }
#endif
```

### 17.4 Built-in DayZ Defines

| Define | Present When | Typical Use |
|--------|-------------|-------------|
| `SERVER` | Server build (`-server` flag) | Server-only operations (hive, auth, save) |
| `CLIENT` | Client build | Client-only operations (UI, input, rendering) |
| `WORKBENCH` | Running in Workbench IDE | Debug code that should not ship |
| `DAYZ` | Always defined in DayZ | Identifying DayZ vs other Enfusion titles |
| `PLATFORM_WINDOWS` | Windows build | Platform-specific code |

```c
// Combine defines for fine-grained control
#ifdef WORKBENCH
    // Workbench-only debug helpers
    void DebugSpawnAnyItem(string type)
    {
        EntityAI item = EntityAI.Cast(GetGame().SpawnEntity(type, "0 0 0"));
        Print("[DEBUG] Spawned: " + type);
    }
#endif

// Common pattern: workbench-only cheat bind
#ifdef WORKBENCH
    GetGame().GetInputManager().AddActionListener("CheatKey", this, "OnCheatKey");
#endif
```

### 17.5 Stringification and Token Pasting (`#` and `##`)

```c
#define STRINGIFY(x) #x
#define CONCAT(a, b) a ## b

void Test()
{
    Print(STRINGIFY(hello));        // prints "hello"

    int VAR_xy = 100;
    Print(CONCAT(VAR_, xy));        // reads VAR_xy -> prints "100"
}
```

> These operators are rarely used in DayZ scripts but available for advanced metaprogramming.

### 17.6 Preprocessor vs `const` vs `static const`

| Feature | `#define` | `const` | `static const` (in class) |
|---------|-----------|---------|--------------------------|
| **Scope** | Global (file-wide) | Per-file or per-class | Per-class |
| **Type safety** | None (textual replace) | Yes | Yes |
| **Memory** | None (compile-time) | Allocated if address taken | Allocated per-class |
| **Used for** | Conditional compilation, guards | Numeric constants, array sizes | Class-level constants |
| **Overridable in modded** | No | Yes (modded class) | Yes (modded class) |

---

## 18. Type Casting and Type Inspection

Enforce Script provides several mechanisms for safe type conversion and runtime type identification.

### 18.1 Safe Downcasting with `ClassName.Cast()`

The primary casting mechanism is the static `Cast()` method on the target class. It returns `null` on failure instead of crashing:

```c
void TestCasting()
{
    EntityAI entity = GetGame().GetPlayer();    // Returns DayZPlayer as EntityAI

    // Safe downcast — returns null if cast fails
    DayZPlayer player = DayZPlayer.Cast(entity);
    if (player)
    {
        Print("Successfully cast to DayZPlayer");
    }

    // Cast to an incompatible type — returns null
    CarScript car = CarScript.Cast(entity);
    if (!car)
    {
        Print("Entity is not a car — cast returned null");
    }
}
```

> **Always use `Cast()` over direct assignment** when downcasting. Direct assignment of a base-type reference to a derived-type variable compiles but can cause unsafe access.

### 18.2 Unsafe Direct Cast

```c
// UNSAFE — compiles but may produce invalid pointer
void UnsafeCast(EntityAI entity)
{
    // This compiles but bypasses type checking — avoid this pattern
    CarScript car = entity;     // NO — implicit downcast, dangerous
}

// SAFE
void SafeCast(EntityAI entity)
{
    CarScript car = CarScript.Cast(entity);
    if (car) { /* safe */ }
}
```

### 18.3 Type Inheritance Check: `IsInherited()`

Checks whether an object's class inherits from (or is) a specified type:

```c
void CheckType(EntityAI entity)
{
    if (entity.IsInherited(DayZPlayer))
    {
        Print("This entity is a player or inherits from DayZPlayer");
    }

    if (entity.IsInherited(Transport))
    {
        Print("This entity is a vehicle (inherits from Transport)");
    }
}
```

### 18.4 `typename` and `InstanceType()`

The `typename` keyword represents a type at runtime. It is essentially a type handle:

```c
void TypeNameExample()
{
    // Compare runtime types
    EntityAI entity = GetGame().GetPlayer();

    typename entityType = entity.InstanceType();
    typename targetType = DayZPlayer;

    if (entityType == targetType)
    {
        Print("Entity is exactly DayZPlayer (not a subclass)");
    }

    // TypeName can be used with arrays
    array<typename> typeList = new array<typename>();
    typeList.Insert(DayZPlayer);
    typeList.Insert(Transport);
    typeList.Insert(InventoryItem);
}

// typename as function parameter
void SpawnByTypeName(typename type, vector position)
{
    EntityAI entity = EntityAI.Cast(GetGame().SpawnEntity(type, position));
    if (entity)
    {
        Print("Spawned: " + type);
    }
}

void Test()
{
    SpawnByTypeName(M4A1, "0 2 0");
    SpawnByTypeName(BandageDressing, "5 2 0");
}
```

### 18.5 `GetType()` — String Type Name

Every entity has a `GetType()` method that returns the **config class name** as a string:

```c
void PrintEntityType(EntityAI entity)
{
    string typeName = entity.GetType();     // e.g., "M4A1", "BandageDressing"
    string className = entity.ClassName();  // e.g., "M4A1", "BandageDressing"

    Print("Config type: " + typeName);
}
```

> `GetType()` and `ClassName()` typically return the same value for gameplay entities. `GetType()` reads from the config class, while `ClassName()` is the script class name.

### 18.6 Type Conversion Reference

```c
void ConversionExamples()
{
    // int → float (implicit)
    int i = 5;
    float f = i;            // 5.0

    // float → int (implicit, truncates)
    float pi = 3.14;
    int ip = pi;            // 3

    // string → int/float (explicit via helper)
    string s = "42";
    int si = s.ToInt();     // 42

    string sf = "3.14";
    float sfv = sf.ToFloat();   // 3.14

    // vector ↔ string
    vector v = "10 20 30";
    string vs = v.ToString();       // "10 20 30"
    vector v2 = "1 2 3".ToVector(); // <1, 2, 3>
}
```

---

## 19. Built-in Method Reference

### 19.1 String Methods

Strings are passed by value. Key methods available on every `string`:

| Method | Signature | Description |
|--------|-----------|-------------|
| `Length` | `int Length()` | Returns character count |
| `Get` | `string Get(int pos)` | Character at position |
| `Set` | `void Set(int pos, string char)` | Set character at position |
| `IndexOf` | `int IndexOf(string sub)` | First index of substring (-1 if not found) |
| `LastIndexOf` | `int LastIndexOf(string sub)` | Last index of substring |
| `Substring` | `string Substring(int start, int count)` | Extract substring |
| `SubstringLen` | `string SubstringLen(int start)` | From start to end |
| `ToUpper` | `string ToUpper()` | Uppercase copy |
| `ToLower` | `string ToLower()` | Lowercase copy |
| `Trim` | `string Trim()` | Remove leading/trailing whitespace |
| `ToInt` | `int ToInt()` | Parse as integer |
| `ToFloat` | `float ToFloat()` | Parse as float |
| `ToVector` | `vector ToVector()` | Parse as `"x y z"` |
| `Split` | `TStringArray Split(string delimiter)` | Split into array |
| `Replace` | `string Replace(string from, string to)` | Replace all occurrences |
| `Contains` | `bool Contains(string sub)` | Checks if substring exists |
| `StartsWith` | `bool StartsWith(string prefix)` | Prefix check |
| `EndsWith` | `bool EndsWith(string suffix)` | Suffix check |
| `Format` | `string Format(params)` | String formatting (see below) |

```c
void StringExamples()
{
    string text = "Hello World";

    Print(text.Length());           // 11
    Print(text.IndexOf("World"));   // 6
    Print(text.Substring(0, 5));    // "Hello"
    Print(text.ToUpper());          // "HELLO WORLD"
    Print(text.Contains("World"));  // true
    Print(text.Replace("World", "DayZ")); // "Hello DayZ"

    // String formatting
    int hp = 75;
    string name = "Player1";
    string formatted = string.Format("%1 has %2 HP", name, hp);
    Print(formatted);               // "Player1 has 75 HP"

    // Split
    TStringArray parts = "a,b,c".Split(",");
    // parts[0] = "a", parts[1] = "b", parts[2] = "c"
}
```

> `string.Format()` uses `%1`, `%2`, etc. as positional placeholders — similar to printf but with position-based indexing.

### 19.2 Array Methods (`array<T>`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `Count` | `int Count()` | Number of elements |
| `Get` | `T Get(int index)` | Element at index |
| `Set` | `void Set(int index, T value)` | Set element at index |
| `Insert` | `void Insert(T value)` | Append to end |
| `InsertAt` | `void InsertAt(int index, T value)` | Insert at position |
| `Remove` | `void Remove(int index)` | Remove at position |
| `RemoveItem` | `void RemoveItem(T value)` | Remove first matching |
| `Clear` | `void Clear()` | Remove all elements |
| `Find` | `int Find(T value)` | First index of value (-1 if not found) |
| `Reverse` | `void Reverse()` | Reverse order in-place |
| `Sort` | `void Sort()` | Sort ascending |
| `Resize` | `void Resize(int size)` | Change array capacity |
| `IsEmpty` | `bool IsEmpty()` | True if count == 0 |

```c
void ArrayExamples()
{
    autoptr TStringArray names = new TStringArray;

    names.Insert("Charlie");
    names.Insert("Alice");
    names.Insert("Bob");

    Print(names.Count());           // 3
    Print(names.Get(1));            // "Alice"

    names.Sort();                   // ["Alice", "Bob", "Charlie"]

    int idx = names.Find("Bob");
    Print(idx);                     // 1 (after sort)

    names.RemoveItem("Alice");      // ["Bob", "Charlie"]

    // Index operator also works
    Print(names[0]);                // "Bob"

    // Static array init shorthand for dynamic arrays
    array<int> numbers = { 7, 3, 6, 8 };
}
```

### 19.3 Vector Operations

Vectors are 3-component float values (`float x, y, z`). Access components by index or name:

```c
void VectorExamples()
{
    vector a = "1 2 3";
    vector b = "4 5 6";

    // Component access
    Print(a[0]);            // 1 (x)
    Print(a[1]);            // 2 (y)
    Print(a[2]);            // 3 (z)

    // Arithmetic
    vector sum = a + b;         // <5, 7, 9>
    vector diff = a - b;        // <-3, -3, -3>
    vector scaled = a * 2.0;    // <2, 4, 6>
    vector divided = a / 2.0;   // <0.5, 1, 1.5>

    // Negation
    vector neg = -a;            // <-1, -2, -3>

    // Length and distance
    float len = vector.Distance(a, "0 0 0");    // sqrt(14)
    float len2 = a.Length();                     // Not available — use vector.Distance

    // Normalization
    vector dir = a.Normalized();
    Print(dir);                 // unit-length vector

    // Cross product
    vector cross = a % b;       // cross product operator
    // a × b = (a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x)

    // Comparison
    if (a == b) { }
    if (a != b) { }

    // String conversion
    string sv = a.ToString();       // "1 2 3"
    vector v2 = "7 8 9".ToVector(); // <7, 8, 9>
}
```

### 19.4 Map Methods (`map<K, V>`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `Count` | `int Count()` | Number of key-value pairs |
| `Get` | `V Get(K key)` | Value by key (or default) |
| `Set` | `V Set(K key, V value)` | Insert or update |
| `Contains` | `bool Contains(K key)` | Key exists |
| `Remove` | `void Remove(K key)` | Remove by key |
| `Clear` | `void Clear()` | Remove all entries |
| `GetKeyByIndex` | `K GetKeyByIndex(int i)` | Key at index (for iteration) |
| `GetElementByIndex` | `V GetElementByIndex(int i)` | Value at index |

```c
void MapExamples()
{
    auto inventory = new map<string, int>();

    // Insert or update using operator[]
    inventory["apple"] = 3;
    inventory["bandage"] = 5;
    inventory["apple"] = 2;         // overwrite

    // Check existence
    if (inventory.Contains("apple"))
    {
        Print("Has apples: " + inventory["apple"]);    // 2
    }

    // Iteration (preferred method)
    foreach (auto item, auto count : inventory)
    {
        Print(item + " x" + count);
    }

    // Index-based iteration
    for (int i = 0; i < inventory.Count(); i++)
    {
        string key = inventory.GetKeyByIndex(i);
        int val = inventory.GetElementByIndex(i);
        Print(key + " = " + val);
    }
}
```

---

## 20. The Param Serialization System

The `Param` system is Enforce Script's mechanism for **typed serialization** — converting data into a binary stream for RPC, persistence, or storage. Params are strongly typed wrappers around values.

### 20.1 Basic Param Types

| Class | Holds | Used For |
|-------|-------|----------|
| `Param1<T>` | Single value | Simple RPC arguments |
| `Param2<T1, T2>` | Two values | Key-value pairs |
| `Param3<T1, T2, T3>` | Three values | Compound data |
| `Param4<T1, T2, T3, T4>` | Four values | Extended data |
| `Param` (base) | Read context | Reading serialized data |

### 20.2 Writing Params

```c
void WriteExample()
{
    // Create a param with typed data
    Param2<string, int> data = new Param2<string, int>("Player1", 100);

    // Serialize to write context
    ParamWriter writer = new ParamWriter();
    data.Write(writer);

    // writer now contains the binary data — can be sent via RPC or saved
}
```

### 20.3 Reading Params

```c
void ReadExample(ParamsReadContext ctx)
{
    // Create typed param matching what was written
    Param2<string, int> data = new Param2<string, int>("", 0);

    // Deserialize
    if (data.Read(ctx))
    {
        string name = data.param1;
        int score = data.param2;
        Print(name + " has score " + score);
    }
}
```

### 20.4 Param in RPC Communication

```c
// SENDING (client)
void SendPlayerData()
{
    Param2<string, vector> data = new Param2<string, vector>(
        GetGame().GetPlayer().GetIdentity().GetPlainName(),
        GetGame().GetPlayer().GetPosition()
    );

    ScriptRPC rpc = new ScriptRPC();
    rpc.WriteParam(data);               // Write the typed param
    rpc.Send(null, ERPCs.RPC_MOD_SYNC, true, null);
}

// RECEIVING (server)
void OnModSync(ParamsReadContext ctx, PlayerIdentity sender)
{
    Param2<string, vector> data = new Param2<string, vector>("", "0 0 0");
    if (ctx.Read(data))
    {
        string playerName = data.param1;
        vector position = data.param2;
        // Handle the data...
    }
}
```

### 20.5 Direct Param Read/Write

You can also read and write raw types to a `ParamsReadContext` without typed wrappers:

```c
// Writing raw data
ScriptRPC rpc = new ScriptRPC();
rpc.Write("Player1");           // string
rpc.Write(100);                 // int
rpc.Write(3.14);                // float
rpc.Write("1 2 3".ToVector());  // vector
rpc.Send(null, ERPCs.RPC_MOD_SYNC, true, null);

// Reading raw data
void OnModSync(ParamsReadContext ctx, PlayerIdentity sender)
{
    string name;
    int score;
    float value;
    vector pos;

    ctx.Read(name);
    ctx.Read(score);
    ctx.Read(value);
    ctx.Read(pos);
}
```

---

## 21. Runtime Config Access

Scripts read config data at runtime through the `Game` API, using path-style keys to navigate the config hierarchy.

### 21.1 Config Path Syntax

Config paths use space-separated segments:
```
"CfgVehicles M4A1 weight"
"CfgWeapons BandageDressing displayName"
"CfgPatches DZ_Scripts requiredAddons"
```

### 21.2 Reading Config Values

```c
void ReadConfigExamples()
{
    Game game = GetGame();

    // Basic types
    float weight = game.GetConfigFloat("CfgVehicles M4A1 weight");
    int maxHealth = game.GetConfigInt("CfgVehicles M4A1 health");
    string displayName = game.GetConfigString("CfgVehicles M4A1 displayName");

    // Config arrays (e.g., itemSize[])
    string itemSize = game.GetConfigText("CfgVehicles BandageDressing itemSize");
    // Returns something like "{1,1}"

    // Check if a config entry exists
    bool exists = game.ConfigIsExisting("CfgWeapons MyMod_CustomRifle");
    if (exists)
    {
        // Safe to read
    }

    // Get all child classes under a config path
    autoptr TStringArray weapons = new TStringArray();
    game.ConfigGetChildNames("CfgWeapons", weapons);
    foreach (string weapon : weapons)
    {
        Print(weapon);   // Prints all weapon class names
    }
}
```

### 21.3 Config Access Patterns

```c
// Safe read with fallback
float GetModValue(string path, float defaultValue)
{
    if (GetGame().ConfigIsExisting(path))
    {
        return GetGame().GetConfigFloat(path);
    }
    return defaultValue;
}

// Read config for any entity type
string GetEntityDisplayName(EntityAI entity)
{
    return GetGame().GetConfigString(
        "CfgVehicles " + entity.GetType() + " displayName"
    );
}

// Iterate config hierarchy
void ListConfigHierarchy(string basePath)
{
    autoptr TStringArray children = new TStringArray();
    GetGame().ConfigGetChildNames(basePath, children);
    foreach (string child : children)
    {
        Print(basePath + " > " + child);
    }
}
```

### 21.4 Writing Config (Modifying at Runtime)

> Config data is **read-only at runtime** in DayZ. To modify config values, you must edit `config.cpp` files and restart. The config system provides runtime reads only.

---

## 22. Scheduling and Deferred Execution

DayZ provides several mechanisms for running code after a delay or on a recurring schedule.

### 22.1 CallQueue — Deferred Callbacks

The `CallQueue` system lets you schedule functions to run at specific points in the frame lifecycle:

```c
void CallQueueExamples()
{
    // Execute next frame
    GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY)
        .Call(this, "MyCallback");

    // Execute after a delay (in seconds)
    GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY)
        .CallLater(this, "MyCallback", 5.0, false);     // once after 5s

    // Execute repeatedly
    GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY)
        .CallLater(this, "MyRepeatingCallback", 1.0, true);  // every 1s

    // Remove a pending call
    GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY)
        .Remove(this, "MyRepeatingCallback");
}

void MyCallback()
{
    Print("Callback executed!");
}

void MyRepeatingCallback()
{
    Print("Tick...");
}
```

### 22.2 Call Categories

| Category | Purpose |
|----------|---------|
| `CALL_CATEGORY_GAMEPLAY` | Main gameplay loop (most common) |
| `CALL_CATEGORY_SYSTEM` | Engine system updates |
| `CALL_CATEGORY_GUI` | UI-related deferred calls |
| `CALL_CATEGORY_INPUT` | Input processing |

> The gameplay category is the one to use for almost all mod code. It runs once per frame as part of the main update loop.

### 22.3 Direct `CallLater` on Objects

Many DayZ base classes (like `EntityAI`, `MissionBase`) have a built-in `CallLater` method:

```c
class MyItem : InventoryItem
{
    void OnItemUsed()
    {
        // Built-in CallLater on EntityAI-based objects
        CallLater(this.CheckExpiration, 60.0, false);
    }

    void CheckExpiration()
    {
        Print("Item checked for expiration");
    }
}
```

### 22.4 Timer with Conditional Stop

```c
class MyTimerExample
{
    int m_Ticks;

    void StartTimer()
    {
        m_Ticks = 0;
        GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY)
            .CallLater(this, "OnTick", 0.5, true);
    }

    void OnTick()
    {
        m_Ticks++;
        Print("Tick " + m_Ticks);

        if (m_Ticks >= 10)
        {
            // Stop the timer
            GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY)
                .Remove(this, "OnTick");
            Print("Timer stopped");
        }
    }
}
```

> **Note:** When using `CallLater` with `repeating = true`, always ensure you have a way to stop it (via `Remove`). Orphaned repeating callbacks can cause memory leaks and unexpected behavior.

---

## 23. Common Language Patterns

These are recurring patterns found throughout the DayZ Enforce Script codebase that are useful for modders and AI agents to recognize and replicate.

### 23.1 Singleton Accessor Pattern

The most common pattern in DayZ — accessing global singleton instances:

```c
// Access the game instance (most common singleton)
Game game = GetGame();

// Access the player
DayZPlayer player = DayZPlayer.Cast(GetGame().GetPlayer());

// Access the UI manager
UIManager ui = GetGame().GetUIManager();

// Access the input manager
InputManager input = GetGame().GetInputManager();
```

### 23.2 Null-Guard Pattern

Always guard against null when working with object references:

```c
void SafePlayerAction()
{
    DayZPlayer player = DayZPlayer.Cast(GetGame().GetPlayer());

    // One-line guard
    if (!player) return;

    // Or with an alternative action
    if (!player)
    {
        Error("Cannot act — no player available");
        return;
    }

    // Safe to use player here
    vector pos = player.GetPosition();
}
```

### 23.3 Config-Driven Factory Pattern

Creating objects based on runtime type rather than hardcoded classes:

```c
EntityAI SpawnItemAtPlayer(string itemType)
{
    PlayerBase player = PlayerBase.Cast(GetGame().GetPlayer());
    if (!player)
    {
        Error("No player found");
        return null;
    }

    // Spawn by config class name — works for any item defined in config
    EntityAI item = EntityAI.Cast(
        GetGame().SpawnEntity(itemType, player.GetPosition() + "0 2 0")
    );

    if (item)
    {
        Print("Spawned " + itemType + " at " + player.GetPosition());
    }
    else
    {
        Error("Failed to spawn: " + itemType + " (check config class name)");
    }

    return item;
}

// Usage
void Test()
{
    SpawnItemAtPlayer("M4A1");
    SpawnItemAtPlayer("Apple");
    SpawnItemAtPlayer("MyMod_CustomItem");
}
```

### 23.4 Event Listener Pattern

Using `ScriptInvoker` for decoupled event handling:

```c
// Event source
class MyEventSource
{
    ScriptInvoker m_OnPlayerDeath;

    void MyEventSource()
    {
        m_OnPlayerDeath = new ScriptInvoker();
    }

    void TriggerDeathEvent(DayZPlayer player)
    {
        // Notify all listeners
        if (m_OnPlayerDeath)
        {
            m_OnPlayerDeath.Invoke(player);
        }
    }
}

// Event listener
class MyEventListener
{
    void Init(MyEventSource source)
    {
        // Subscribe to the event
        source.m_OnPlayerDeath.Insert(this, "OnPlayerDied");
    }

    void OnPlayerDied(DayZPlayer player)
    {
        Print("Player died: " + player.GetIdentity().GetPlainName());
    }

    void Deinit(MyEventSource source)
    {
        // Unsubscribe
        source.m_OnPlayerDeath.Remove(this, "OnPlayerDied");
    }
}
```

### 23.5 Component Access Pattern

Accessing components on entities:

```c
void InspectPlayerComponents()
{
    DayZPlayer player = DayZPlayer.Cast(GetGame().GetPlayer());
    if (!player) return;

    // Get inventory component
    Inventory inventory = player.GetInventory();
    if (inventory)
    {
        // Iterate items in inventory
        autoptr TStringArray itemNames = new TStringArray();
        inventory.GetItemsNames(itemNames);
        foreach (string itemName : itemNames)
        {
            Print("Has item: " + itemName);
        }
    }

    // Get health component
    HumanEntityAI human = HumanEntityAI.Cast(player);
    if (human)
    {
        float health = human.GetHealth("GlobalHealth", "Health");
        float blood = human.GetHealth("GlobalHealth", "Blood");
        Print("HP: " + health + ", Blood: " + blood);
    }
}
```

### 23.6 Mod Initialization Pattern

How mods typically set themselves up:

```c
// In 5_mission/mission/mymod_mission.c
modded class MissionServer
{
    override void OnInit()
    {
        super.OnInit();

        // Register RPC handlers
        GetGame().RPCRegisterServer(
            this, ERPCs.RPC_MYMOD_EVENT, "OnMyModEvent"
        );

        // Start periodic update
        GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY)
            .CallLater(this, "MyModUpdate", 1.0, true);

        Print("MyMod initialized on server");
    }

    void MyModUpdate()
    {
        // Periodic update logic
    }

    void OnMyModEvent(ParamsReadContext ctx, PlayerIdentity sender)
    {
        // Handle RPC
    }
};

modded class MissionClient
{
    override void OnInit()
    {
        super.OnInit();

        // Client-side initialization
        GetGame().RPCRegisterClient(
            this, ERPCs.RPC_MYMOD_EVENT, "OnMyModEvent"
        );

        Print("MyMod initialized on client");
    }

    void OnMyModEvent(ParamsReadContext ctx)
    {
        // Handle client RPC
    }
};
```

### 23.7 State Machine Pattern

Simple state machine for objects with distinct modes:

```c
enum ItemState
{
    IDLE,
    ACTIVE,
    COOLDOWN,
    DEPLETED
}

class StatefulItem : InventoryItem
{
    ItemState m_State;
    float m_CooldownTimer;

    void StatefulItem()
    {
        m_State = ItemState.IDLE;
    }

    void OnActivate()
    {
        switch (m_State)
        {
            case ItemState.IDLE:
                Print("Activating...");
                m_State = ItemState.ACTIVE;
                break;

            case ItemState.COOLDOWN:
                Print("On cooldown, cannot activate");
                break;

            case ItemState.DEPLETED:
                Print("Item is depleted");
                break;
        }
    }

    void OnUpdate(float deltaTime)
    {
        switch (m_State)
        {
            case ItemState.ACTIVE:
                // Do active behavior
                m_CooldownTimer += deltaTime;
                if (m_CooldownTimer >= 5.0)
                {
                    m_State = ItemState.COOLDOWN;
                    m_CooldownTimer = 0;
                }
                break;

            case ItemState.COOLDOWN:
                m_CooldownTimer += deltaTime;
                if (m_CooldownTimer >= 10.0)
                {
                    m_State = ItemState.IDLE;
                    m_CooldownTimer = 0;
                }
                break;
        }
    }
}
```

---

## 24. Best Practices for AI Agents

When generating or analysing Enforce Script code, follow these guidelines:

### 17.1 Memory Safety

1. **Prefer `Managed`** for gameplay classes — soft links prevent dangling pointers.
2. **Use `ref` on member variables** that own a child object.
3. **Use `autoptr`** for local variables that own temporary objects.
4. **Avoid raw `delete`** when ARC (`Managed` + `ref`) can handle it.
5. **Check for `null`** before dereferencing object pointers:

```c
void SafeMethod(MyClass o)
{
    if (o)      // null check
    {
        o.Say();
    }
}
```

### 17.2 Mod Compatibility

1. **Use `modded`** instead of overriding entire files.
2. **Call `super`** in overrides to preserve base behavior.
3. **Prefix classes** with your mod identifier to avoid name clashes.
4. **Use high enum values** for custom RPC IDs (e.g., `10000+`).

### 17.3 Performance

1. **Cache `Count()`** outside loops for dynamic arrays.
2. **Prefer `foreach`** over indexed `for` for readability.
3. **Avoid creating objects** in hot code paths (per-frame).
4. **Use `static` functions** for utility methods that don't need instance state.

### 17.4 Code Style

1. Match the existing style — DayZ scripts use `m_` prefix for member variables.
2. Use `override` on all overridden methods — the compiler checks signature matching.
3. Default parameters go at the end of the parameter list.
4. Keep one statement per line for clarity.

### 17.5 Common Pitfalls

```c
// PITFALL 1: Dangling pointer
MyClass a = new MyClass();
MyClass b = a;
delete a;
b.Say();                // CRASH — b is dangling (unless Managed)

// PITFALL 2: Array of weak refs
array<MyClass> list = new array<MyClass>();
list.Insert(new MyClass());     // Object deleted immediately!
                                // No strong ref keeps it alive
// FIX:
array<ref MyClass> list = new array<ref MyClass>();
list.Insert(new MyClass());     // Stays alive

// PITFALL 3: Variable shadowing
int x = 5;
if (true)
{
    int x = 10;                 // ERROR: multiple declaration
}

// PITFALL 4: Server-only code on client
#ifdef SERVER
// Hive operations — safe
HiveRequest req = new HiveRequest();
#endif
```

---

## 25. Quick Reference: Keywords

| Keyword | Category | Purpose |
|---------|----------|---------|
| `class` | Declaration | Define a new class |
| `extends` | Inheritance | Inherit from a parent class |
| `modded` | Modding | Non-destructive class extension |
| `new` | Memory | Create an object instance |
| `delete` | Memory | Destroy an object instance |
| `ref` | Memory | Strong reference modifier |
| `autoptr` | Memory | Auto-destroyed pointer |
| `private` | Access | Class-only access |
| `protected` | Access | Class and subclass access |
| `static` | Modifier | Class-level (no instance needed) |
| `override` | Modifier | Override a base-class method |
| `const` | Modifier | Read-only value |
| `out` | Parameter | Pass by reference (written) |
| `inout` | Parameter | Pass by reference (read+write) |
| `this` | Reference | Current instance |
| `super` | Reference | Base class instance |
| `null` | Literal | Null pointer value |
| `return` | Control | Exit function, optionally with value |
| `thread` | Execution | Run function on a new thread |
| `auto` | Type | Compile-time type inference |
| `typedef` | Type | Type alias |
| `typename` | Type | Runtime type identifier |
| `proto` | Native | C++ function prototype binding |
| `native` | Native | C++ function call convention |
| `#define` | Preprocessor | Textual macro definition |
| `#undef` | Preprocessor | Remove macro definition |
| `#ifdef` / `#ifndef` | Preprocessor | Conditional compilation check |
| `#if` | Preprocessor | Expression-based conditional |
| `#else` / `#endif` | Preprocessor | Alternative / end conditional |
| `enum` | Declaration | Named integer constant set |
| `foreach` | Iteration | Collection iteration |
| `for` | Iteration | Counter-based loop |
| `while` | Iteration | Condition-based loop |
| `if` / `else` | Control | Conditional branch |
| `switch` / `case` | Control | Multi-way branch |
| `break` | Control | Exit loop or switch case |
| `default` | Control | Fallback switch case |
| `true` / `false` | Literal | Boolean values |
| `Managed` | Base class | Enables ARC and soft links |

---

## 26. Quick Reference: Preprocessor Defines

| Define | Context | Purpose |
|--------|---------|---------|
| `SERVER` | Server executable | Guard server-only logic (hive, persistence, auth) |
| `CLIENT` | Client executable | Guard client-only logic (UI, input, rendering) |
| `WORKBENCH` | Workbench IDE | Guard debug/testing code that should not ship |
| `DAYZ` | Always | Identifies DayZ vs other Enfusion titles |
| `PLATFORM_WINDOWS` | Windows build | Windows-specific code |

---

## 27. Quick Reference: API Accessors

| Expression | Returns | Layer |
|-----------|---------|-------|
| `GetGame()` | `Game` / `DayZGame` instance | 2_gamelib |
| `GetGame().GetPlayer()` | `IEntity` (cast to `DayZPlayer`) | 3_game |
| `GetGame().GetUIManager()` | `UIManager` | 2_gamelib |
| `GetGame().GetInputManager()` | `InputManager` | 2_gamelib |
| `GetGame().GetCallQueue(category)` | `CallQueue` | 2_gamelib |
| `GetGame().GetWorldEntity()` | `World` | 3_game |
| `GetGame().GetConfigFloat(path)` | `float` | 2_gamelib |
| `GetGame().GetConfigInt(path)` | `int` | 2_gamelib |
| `GetGame().GetConfigString(path)` | `string` | 2_gamelib |
| `GetGame().ConfigIsExisting(path)` | `bool` | 2_gamelib |
| `GetGame().ConfigGetChildNames(path, out)` | `void` | 2_gamelib |
| `GetGame().SpawnEntity(type, pos)` | `IEntity` | 3_game |
| `GetGame().RPCRegisterServer(obj, rpc, fn)` | `void` | 2_gamelib |
| `GetGame().RPCRegisterClient(obj, rpc, fn)` | `void` | 2_gamelib |

---

## See Also

- **[Script Layers](/script-layers/)** — Where Enforce Script files live
- **[Scripts vs Config](/architecture/script-vs-config)** — Scripts vs `config.cpp` data
- **[Safe Modding Patterns](/modding/safe-patterns)** — Best practices for mod scripts
- **[Common APIs](/modding/common-apis)** — Key DayZ scripting APIs
- **[Mod Project Structure](/modding/mod-structure)** — How to organize a mod
- **[DayZ: Enforce Script Syntax](https://community.bistudio.com/wiki/DayZ:Enforce_Script_Syntax)** — Official Bohemia Interactive reference
