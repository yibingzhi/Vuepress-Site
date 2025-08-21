---
tags:
  - 前端
  - TypeScript
  - TS
  - 类型系统
title: TypeScript详解
createTime: 2025/08/16 14:42:53
permalink: /article/uttnaydi/
---

## 什么是TypeScript

TypeScript是JavaScript的超集，由微软开发。它在JavaScript的基础上添加了静态类型检查、面向对象编程、接口、泛型等特性，使JavaScript更适合大型项目的开发。

### 主要特性

- **静态类型检查**：编译时检查类型错误
- **面向对象编程**：支持类、接口、继承等
- **泛型支持**：提供类型安全的代码复用
- **装饰器**：支持元数据编程
- **模块系统**：ES6模块和命名空间
- **工具支持**：更好的IDE支持和重构工具

### 与JavaScript的关系

- TypeScript是JavaScript的超集
- TypeScript编译后生成JavaScript代码
- 所有JavaScript代码都是有效的TypeScript代码
- TypeScript提供了类型安全和更好的开发体验

## 环境搭建

### 1. 安装Node.js

```bash
# 检查Node.js版本
node --version
npm --version

# 安装TypeScript
npm install -g typescript

# 检查TypeScript版本
tsc --version
```

### 2. 创建TypeScript项目

```bash
# 创建项目目录
mkdir typescript-demo
cd typescript-demo

# 初始化package.json
npm init -y

# 安装TypeScript开发依赖
npm install --save-dev typescript @types/node

# 初始化TypeScript配置
npx tsc --init
```

### 3. TypeScript配置文件

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": [
      "ES2020"
    ],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 4. 开发工具配置

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

## 基础语法

### 1. 变量声明

```typescript
// 基本类型声明
let name: string = "张三";
let age: number = 25;
let isStudent: boolean = true;
let hobbies: string[] = ["读书", "游泳"];
let scores: number[] = [85, 90, 78];

// 类型推断
let message = "Hello TypeScript"; // 自动推断为string类型
let count = 42; // 自动推断为number类型

// 联合类型
let status: "success" | "error" | "loading" = "success";
let value: string | number = "hello";

// 任意类型
let anyValue: any = "可以是任何类型";
anyValue = 42;
anyValue = true;

// 未知类型（更安全的any）
let unknownValue: unknown = "未知类型";
// unknownValue.toUpperCase(); // 编译错误，需要类型检查
if (typeof unknownValue === "string") {
    console.log(unknownValue.toUpperCase()); // 类型检查后可以使用
}
```

### 2. 类型注解

```typescript
// 函数参数和返回值类型
function add(a: number, b: number): number {
    return a + b;
}

// 箭头函数类型
const multiply = (a: number, b: number): number => a * b;

// 对象类型
let person: {
    name: string;
    age: number;
    email?: string; // 可选属性
} = {
    name: "李四",
    age: 30
};

// 数组类型
let numbers: Array<number> = [1, 2, 3, 4, 5];
let strings: string[] = ["a", "b", "c"];

// 元组类型
let tuple: [string, number, boolean] = ["hello", 42, true];
```

### 3. 类型断言

```typescript
// 类型断言
let someValue: unknown = "这是一个字符串";
let strLength: number = (someValue as string).length;

// 另一种语法
let strLength2: number = (<string>someValue).length;

// 非空断言
let element: HTMLElement | null = document.getElementById("myElement");
element!.style.color = "red"; // 断言element不为null

// 类型守卫
function isString(value: unknown): value is string {
    return typeof value === "string";
}

if (isString(someValue)) {
    console.log(someValue.toUpperCase()); // 类型安全
}
```

## 类型系统

### 1. 基本类型

```typescript
// 数字类型
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;
let bigInt: bigint = 100n;

// 字符串类型
let color: string = "blue";
let fullName: string = `Bob ${color}`;
let sentence: string = "Hello, my name is " + fullName;

// 布尔类型
let isDone: boolean = false;

// 空值类型
let u: undefined = undefined;
let n: null = null;

// void类型（函数无返回值）
function warnUser(): void {
    console.log("This is my warning message");
}

// never类型（永不返回）
function error(message: string): never {
    throw new Error(message);
}

function infiniteLoop(): never {
    while (true) {
    }
}
```

### 2. 对象类型

```typescript
// 对象字面量类型
let point: { x: number; y: number } = {x: 10, y: 20};

// 可选属性
interface SquareConfig {
    color?: string;
    width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
    let newSquare = {color: "white", area: 100};
    if (config.color) {
        newSquare.color = config.color;
    }
    if (config.width) {
        newSquare.area = config.width * config.width;
    }
    return newSquare;
}

// 只读属性
interface Point {
    readonly x: number;
    readonly y: number;
}

let p1: Point = {x: 10, y: 20};
// p1.x = 5; // 编译错误，只读属性不能修改

// 只读数组
let readonlyArray: ReadonlyArray<number> = [1, 2, 3, 4];
// readonlyArray.push(5); // 编译错误
```

### 3. 函数类型

```typescript
// 函数类型表达式
type GreetFunction = (name: string) => string;

let greet: GreetFunction = (name: string) => `Hello, ${name}!`;

// 调用签名
interface DescribableFunction {
    description: string;

    (someArg: number): boolean;
}

function doSomething(fn: DescribableFunction) {
    console.log(fn.description + " returned " + fn(6));
}

// 构造签名
interface CallableConstructor {
    new(hour: number, minute: number): Date;
}

function createInstance(ctor: CallableConstructor, hour: number, minute: number) {
    return new ctor(hour, minute);
}
```

## 高级类型

### 1. 联合类型和交叉类型

```typescript
// 联合类型
type StringOrNumber = string | number;
let value: StringOrNumber = "hello";
value = 42;

// 联合类型的类型守卫
function processValue(value: string | number) {
    if (typeof value === "string") {
        return value.toUpperCase();
    } else {
        return value.toFixed(2);
    }
}

// 交叉类型
interface Person {
    name: string;
    age: number;
}

interface Employee {
    id: number;
    department: string;
}

type EmployeePerson = Person & Employee;

let employee: EmployeePerson = {
    name: "张三",
    age: 30,
    id: 1001,
    department: "技术部"
};
```

### 2. 条件类型

```typescript
// 基本条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type T0 = NonNullable<string | number | null>; // string | number
type T1 = NonNullable<string[] | null | undefined>; // string[]

// 条件类型中的推断
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

type T2 = ReturnType<() => string>; // string
type T3 = ReturnType<() => void>; // void

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;

type T4 = ToArray<string | number>; // string[] | number[]
```

### 3. 映射类型

```typescript
// 基本映射类型
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Partial<T> = {
    [P in keyof T]?: T[P];
};

type Required<T> = {
    [P in keyof T]-?: T[P];
};

// 使用映射类型
interface User {
    id: number;
    name: string;
    email: string;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;

// 自定义映射类型
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

type Record<K extends keyof any, T> = {
    [P in K]: T;
};

type UserNames = Pick<User, "name">;
type UserMap = Record<string, User>;
```

## 函数

### 1. 函数重载

```typescript
// 函数重载
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;
function combine(a: any, b: any): any {
    if (typeof a === "string" && typeof b === "string") {
        return a + b;
    } else if (typeof a === "number" && typeof b === "number") {
        return a + b;
    }
    throw new Error("参数类型不匹配");
}

// 使用重载函数
let result1 = combine("Hello", "World"); // string
let result2 = combine(10, 20); // number
// let result3 = combine("Hello", 20); // 编译错误

// 方法重载
class Calculator {
    add(a: string, b: string): string;
    add(a: number, b: number): number;
    add(a: any, b: any): any {
        if (typeof a === "string" && typeof b === "string") {
            return a + b;
        } else if (typeof a === "number" && typeof b === "number") {
            return a + b;
        }
        throw new Error("参数类型不匹配");
    }
}
```

### 2. 函数类型

```typescript
// 函数类型定义
type BinaryFunction = (a: number, b: number) => number;
type UnaryFunction<T> = (arg: T) => T;

// 高阶函数
function compose<T>(f: UnaryFunction<T>, g: UnaryFunction<T>): UnaryFunction<T> {
    return (x: T) => f(g(x));
}

// 柯里化函数
function curry<T, U, V>(f: (x: T, y: U) => V): (x: T) => (y: U) => V {
    return (x: T) => (y: U) => f(x, y);
}

// 使用柯里化
const add = (a: number, b: number) => a + b;
const curriedAdd = curry(add);
const add5 = curriedAdd(5);
console.log(add5(3)); // 8
```

### 3. 参数和返回值

```typescript
// 可选参数和默认参数
function buildName(firstName: string, lastName?: string, title: string = "Mr."): string {
    if (lastName) {
        return `${title} ${firstName} ${lastName}`;
    }
    return `${title} ${firstName}`;
}

// 剩余参数
function sum(...numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
}

// 参数解构
function printUserInfo({name, age, email = "N/A"}: { name: string; age: number; email?: string }): void {
    console.log(`Name: ${name}, Age: ${age}, Email: ${email}`);
}

// 函数类型作为参数
function processArray<T>(arr: T[], processor: (item: T) => T): T[] {
    return arr.map(processor);
}

// 使用函数类型参数
const numbers = [1, 2, 3, 4, 5];
const doubled = processArray(numbers, x => x * 2);
```

## 类

### 1. 基本类语法

```typescript
// 基本类定义
class Animal {
    // 属性
    private name: string;
    protected age: number;
    public readonly species: string;

    // 构造函数
    constructor(name: string, age: number, species: string) {
        this.name = name;
        this.age = age;
        this.species = species;
    }

    // 方法
    public makeSound(): void {
        console.log("Some sound");
    }

    // 获取器
    public getName(): string {
        return this.name;
    }

    // 设置器
    public setAge(age: number): void {
        if (age >= 0) {
            this.age = age;
        }
    }
}

// 创建实例
const animal = new Animal("Lion", 5, "Mammal");
animal.makeSound();
console.log(animal.getName());
```

### 2. 继承和多态

```typescript
// 继承
class Dog extends Animal {
    private breed: string;

    constructor(name: string, age: number, breed: string) {
        super(name, age, "Mammal");
        this.breed = breed;
    }

    // 重写方法
    public makeSound(): void {
        console.log("Woof! Woof!");
    }

    // 新增方法
    public fetch(): void {
        console.log("Fetching the ball");
    }

    // 获取品种信息
    public getBreed(): string {
        return this.breed;
    }
}

// 多态
function animalSound(animal: Animal): void {
    animal.makeSound(); // 根据实际类型调用相应的方法
}

const dog = new Dog("Buddy", 3, "Golden Retriever");
animalSound(dog); // 输出: Woof! Woof!
```

### 3. 抽象类和接口

```typescript
// 抽象类
abstract class Vehicle {
    protected brand: string;
    protected model: string;

    constructor(brand: string, model: string) {
        this.brand = brand;
        this.model = model;
    }

    // 抽象方法
    abstract start(): void;

    abstract stop(): void;

    // 具体方法
    public getInfo(): string {
        return `${this.brand} ${this.model}`;
    }
}

// 实现抽象类
class Car extends Vehicle {
    constructor(brand: string, model: string) {
        super(brand, model);
    }

    public start(): void {
        console.log("Car engine started");
    }

    public stop(): void {
        console.log("Car engine stopped");
    }
}

// 接口
interface Movable {
    move(): void;

    stop(): void;
}

interface Flyable {
    fly(): void;

    land(): void;
}

// 实现多个接口
class Bird implements Movable, Flyable {
    public move(): void {
        console.log("Bird is moving");
    }

    public stop(): void {
        console.log("Bird stopped");
    }

    public fly(): void {
        console.log("Bird is flying");
    }

    public land(): void {
        console.log("Bird landed");
    }
}
```

### 4. 静态成员和访问修饰符

```typescript
class MathUtils {
    // 静态属性
    public static readonly PI: number = 3.14159;

    // 静态方法
    public static add(a: number, b: number): number {
        return a + b;
    }

    public static multiply(a: number, b: number): number {
        return a * b;
    }

    // 私有静态方法
    private static validateNumber(num: number): boolean {
        return !isNaN(num) && isFinite(num);
    }
}

// 使用静态成员
console.log(MathUtils.PI);
console.log(MathUtils.add(5, 3));
console.log(MathUtils.multiply(4, 2));

// 访问修饰符示例
class AccessExample {
    public publicField: string = "public"; // 任何地方都可以访问
    protected protectedField: string = "protected"; // 类内部和子类可以访问
    private privateField: string = "private"; // 只有类内部可以访问
    readonly readonlyField: string = "readonly"; // 只读，不能修改

    public publicMethod(): void {
        console.log(this.privateField); // 可以访问私有成员
    }

    protected protectedMethod(): void {
        console.log(this.protectedField);
    }

    private privateMethod(): void {
        console.log(this.privateField);
    }
}
```

## 接口

### 1. 基本接口

```typescript
// 基本接口定义
interface User {
    id: number;
    name: string;
    email: string;
    age?: number; // 可选属性
    readonly createdAt: Date; // 只读属性
}

// 实现接口
class UserImpl implements User {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public age: number,
        public readonly createdAt: Date
    ) {
    }
}

// 使用接口
function createUser(userData: User): UserImpl {
    return new UserImpl(
        userData.id,
        userData.name,
        userData.email,
        userData.age || 0,
        new Date()
    );
}

const user = createUser({
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
    createdAt: new Date()
});
```

### 2. 函数接口和可索引接口

```typescript
// 函数接口
interface SearchFunc {
    (source: string, subString: string): boolean;
}

// 实现函数接口
const mySearch: SearchFunc = function (source: string, subString: string): boolean {
    return source.indexOf(subString) > -1;
};

// 可索引接口
interface StringArray {
    [index: number]: string;
}

let myArray: StringArray = ["Alice", "Bob", "Charlie"];
let firstItem: string = myArray[0];

// 字典接口
interface Dictionary {
    [key: string]: any;
}

let myDict: Dictionary = {
    "name": "张三",
    "age": 30,
    "city": "北京"
};
```

### 3. 接口继承和混合

```typescript
// 接口继承
interface Shape {
    color: string;
}

interface Square extends Shape {
    sideLength: number;
}

interface Circle extends Shape {
    radius: number;
}

// 实现继承的接口
class SquareImpl implements Square {
    constructor(public color: string, public sideLength: number) {
    }

    getArea(): number {
        return this.sideLength * this.sideLength;
    }
}

// 接口混合
interface ClockInterface {
    currentTime: Date;

    setTime(d: Date): void;
}

interface ClockConstructor {
    new(hour: number, minute: number): ClockInterface;
}

// 使用接口混合
function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
    return new ctor(hour, minute);
}

class DigitalClock implements ClockInterface {
    constructor(h: number, m: number) {
    }

    currentTime: Date = new Date();

    setTime(d: Date): void {
        this.currentTime = d;
    }
}

let digital = createClock(DigitalClock, 12, 17);
```

## 泛型

### 1. 基本泛型

```typescript
// 泛型函数
function identity<T>(arg: T): T {
    return arg;
}

// 使用泛型函数
let output1 = identity<string>("myString");
let output2 = identity("myString"); // 类型推断

// 泛型接口
interface GenericIdentityFn<T> {
    (arg: T): T;
}

let myIdentity: GenericIdentityFn<number> = identity;

// 泛型类
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
    return x + y;
};
```

### 2. 泛型约束

```typescript
// 基本约束
interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);
    return arg;
}

// 使用约束
loggingIdentity("hello"); // 字符串有length属性
loggingIdentity([1, 2, 3]); // 数组有length属性
// loggingIdentity(3); // 编译错误，数字没有length属性

// 多重约束
interface Nameable {
    name: string;
}

interface Ageable {
    age: number;
}

function processPerson<T extends Nameable & Ageable>(person: T): void {
    console.log(`${person.name} is ${person.age} years old`);
}

// 使用多重约束
processPerson({name: "张三", age: 30, city: "北京"});
```

### 3. 高级泛型

```typescript
// 泛型条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type T0 = NonNullable<string | number | null>; // string | number

// 泛型映射类型
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Partial<T> = {
    [P in keyof T]?: T[P];
};

// 使用映射类型
interface User {
    id: number;
    name: string;
    email: string;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;

// 泛型工具类型
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

type Record<K extends keyof any, T> = {
    [P in K]: T;
};

type UserNames = Pick<User, "name">;
type UserMap = Record<string, User>;
```

## 模块系统

### 1. ES6模块

```typescript
// math.ts
export const PI = 3.14159;

export function add(a: number, b: number): number {
    return a + b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}

// 默认导出
export default class Calculator {
    add(a: number, b: number): number {
        return a + b;
    }
}

// utils.ts
export * from './math'; // 重新导出
export {add as addNumbers} from './math'; // 重命名导出

// main.ts
import {add, multiply, PI} from './math';
import Calculator, {add as addNumbers} from './math';

console.log(PI);
console.log(add(5, 3));
console.log(multiply(4, 2));

const calc = new Calculator();
console.log(calc.add(10, 20));
```

### 2. 命名空间

```typescript
// 命名空间
namespace Validation {
    export interface StringValidator {
        isValid(s: string): boolean;
    }

    export class LettersOnlyValidator implements StringValidator {
        isValid(s: string): boolean {
            return /^[A-Za-z]+$/.test(s);
        }
    }

    export class ZipCodeValidator implements StringValidator {
        isValid(s: string): boolean {
            return s.length === 5 && /^\d+$/.test(s);
        }
    }
}

// 使用命名空间
let validators: { [s: string]: Validation.StringValidator } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();

// 多文件命名空间
// Validation.ts
export namespace Validation {
    export interface StringValidator {
        isValid(s: string): boolean;
    }
}

// LettersOnlyValidator.ts
import {Validation} from './Validation';

export class LettersOnlyValidator implements Validation.StringValidator {
    isValid(s: string): boolean {
        return /^[A-Za-z]+$/.test(s);
    }
}
```

### 3. 模块解析

```typescript
// tsconfig.json中的模块解析配置
{
    "compilerOptions"
:
    {
        "moduleResolution"
    :
        "node",
            "baseUrl"
    :
        "./src",
            "paths"
    :
        {
            "@/*"
        :
            ["*"],
                "@components/*"
        :
            ["components/*"],
                "@utils/*"
        :
            ["utils/*"]
        }
    }
}

// 使用路径映射
import {UserService} from '@/services/UserService';
import {formatDate} from '@utils/dateUtils';
import {Button} from '@components/Button';
```

## 装饰器

### 1. 类装饰器

```typescript
// 类装饰器
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class Greeter {
    greeting: string;

    constructor(message: string) {
        this.greeting = message;
    }

    greet() {
        return "Hello, " + this.greeting;
    }
}

// 装饰器工厂
function color(value: string) {
    return function (target: Function) {
        // 保存对构造函数的引用
        const original = target;

        // 创建新的构造函数
        const f: any = function (...args: any[]) {
            console.log(`Creating instance with color: ${value}`);
            return new original(...args);
        };

        // 复制原型
        f.prototype = original.prototype;

        return f;
    };
}

@color("red")
class ColoredGreeter {
    greeting: string;

    constructor(message: string) {
        this.greeting = message;
    }
}
```

### 2. 方法装饰器

```typescript
// 方法装饰器
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
        console.log(`Calling ${propertyKey} with args:`, args);
        const result = method.apply(this, args);
        console.log(`Result:`, result);
        return result;
    };

    return descriptor;
}

// 参数装饰器
function required(target: any, propertyKey: string, parameterIndex: number) {
    const existingRequiredParameters: number[] = Reflect.getOwnMetadata("required", target, propertyKey) || [];
    existingRequiredParameters.push(parameterIndex);
    Reflect.defineMetadata("required", existingRequiredParameters, target, propertyKey);
}

// 属性装饰器
function readonly(target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
        writable: false
    });
}

class Example {
    @readonly
    name: string = "Example";

    @log
    greet(@required message: string): string {
        return `Hello, ${message}!`;
    }
}
```

### 3. 装饰器组合

```typescript
// 多个装饰器
function first() {
    console.log("first(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("first(): called");
    };
}

function second() {
    console.log("second(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("second(): called");
    };
}

class ExampleClass {
    @first()
    @second()
    method() {
    }
}

// 装饰器执行顺序：从下到上，从上到下
// 输出：
// second(): factory evaluated
// first(): factory evaluated
// first(): called
// second(): called
```

## 工程化配置

### 1. Webpack配置

```typescript
// webpack.config.js
const path = require('path');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: './dist',
        hot: true,
    },
};
```

### 2. ESLint配置

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 3. Prettier配置

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 最佳实践

### 1. 类型安全

```typescript
// 避免使用any
// 不好的做法
function processData(data: any): any {
    return data.map(item => item.value);
}

// 好的做法
interface DataItem {
    value: string;
    id: number;
}

function processData(data: DataItem[]): string[] {
    return data.map(item => item.value);
}

// 使用类型守卫
function isString(value: unknown): value is string {
    return typeof value === "string";
}

function processValue(value: unknown): string {
    if (isString(value)) {
        return value.toUpperCase();
    }
    throw new Error("Value must be a string");
}
```

### 2. 错误处理

```typescript
// 自定义错误类型
class ValidationError extends Error {
    constructor(message: string, public field: string) {
        super(message);
        this.name = "ValidationError";
    }
}

// 使用Result类型
type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
    if (b === 0) {
        return {success: false, error: "Division by zero"};
    }
    return {success: true, data: a / b};
}

// 使用错误
const result = divide(10, 2);
if (result.success) {
    console.log("Result:", result.data);
} else {
    console.error("Error:", result.error);
}
```

### 3. 性能优化

```typescript
// 使用const断言
const colors = ["red", "green", "blue"] as const;
type Color = typeof colors[number];

// 使用条件类型优化
type NonNullable<T> = T extends null | undefined ? never : T;

// 使用映射类型优化
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 使用工具类型
type User = {
    id: number;
    name: string;
    email: string;
    profile: {
        age: number;
        city: string;
    };
};

type PartialUser = DeepPartial<User>;
```

## 常见问题

### 1. 类型错误

```typescript
// 常见类型错误及解决方案
// 错误：类型"string"不能赋值给类型"number"
let age: number = "25"; // 编译错误

// 解决方案：类型断言或类型转换
let age: number = "25" as any; // 不推荐
let age: number = parseInt("25"); // 推荐

// 错误：对象可能为"null"
let element = document.getElementById("myElement");
element.style.color = "red"; // 编译错误

// 解决方案：非空断言或类型守卫
element!.style.color = "red"; // 非空断言
if (element) {
    element.style.color = "red"; // 类型守卫
}
```

### 2. 模块导入问题

```typescript
// 常见模块导入问题
// 错误：找不到模块"@/components/Button"
import {Button} from '@/components/Button';

// 解决方案：检查tsconfig.json中的路径映射
{
    "compilerOptions"
:
    {
        "baseUrl"
    :
        "./src",
            "paths"
    :
        {
            "@/*"
        :
            ["*"]
        }
    }
}

// 错误：模块没有默认导出
import Button from './Button'; // 如果Button没有默认导出

// 解决方案：使用命名导入
import {Button} from './Button';
```

### 3. 泛型使用问题

```typescript
// 常见泛型问题
// 错误：泛型约束不满足
function getLength<T>(arg: T): number {
    return arg.length; // 编译错误，T可能没有length属性
}

// 解决方案：添加约束
function getLength<T extends { length: number }>(arg: T): number {
    return arg.length;
}

// 错误：泛型类型推断失败
function createArray<T>(length: number, value: T): T[] {
    return new Array(length).fill(value);
}

let stringArray = createArray(3, "hello"); // 类型推断为string[]
let numberArray = createArray(3, 42); // 类型推断为number[]
```
