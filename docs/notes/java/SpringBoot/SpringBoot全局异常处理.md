# Spring Boot 全局异常处理笔记

## 一、`@ControllerAdvice` 与 `@ExceptionHandler` 基础
1. **`@ControllerAdvice` 注解**
   - **作用**：
     - 用于定义全局异常处理类。它能够对整个应用中的多个 `@Controller` 或 `@RestController` 进行统一的异常处理增强。当任何被其监控的控制器抛出异常时，该类中的相应异常处理方法将被触发。
     - 可以通过 `basePackages` 属性指定其作用的基础包路径，只处理特定包及其子包下控制器抛出的异常。例如：`@ControllerAdvice(basePackages = "com.example.controller")` 只会处理 `com.example.controller` 包及其子包下控制器的异常。
   - **示例**：
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    // 异常处理方法将定义在这里
}
```
2. **`@ExceptionHandler` 注解**
   - **作用**：
     - 定义在 `@ControllerAdvice` 类中的方法上，用于指定该方法处理的异常类型。当控制器方法抛出指定类型的异常时，对应的 `@ExceptionHandler` 方法就会被调用。
     - 可以处理多种异常类型，如常见的 `RuntimeException`、`IOException` 等，也可以处理自定义异常。
   - **示例**：
     - 处理 `RuntimeException`：
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>("发生运行时异常: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```
     - 处理自定义异常：假设自定义异常 `MyBusinessException` 如下：
```java
public class MyBusinessException extends RuntimeException {
    public MyBusinessException(String message) {
        super(message);
    }
}
```
     - 异常处理方法：
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MyBusinessException.class)
    public ResponseEntity<String> handleMyBusinessException(MyBusinessException ex) {
        return new ResponseEntity<>("业务异常: " + ex.getMessage(), HttpStatus.BAD_REQUEST);
    }
}
```

## 二、返回统一响应格式
1. **定义统一响应实体类**
   - 为了使全局异常处理返回的结果格式统一且更具可读性和规范性，创建一个统一的响应实体类。
   - 示例：
```java
public class ErrorResponse {
    private int status;
    private String message;
    private long timestamp;

    // 生成对应的 getters 和 setters
    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }
}
```
2. **在异常处理方法中使用统一响应实体类**
   - 示例：
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "发生运行时异常: " + ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## 三、处理多种异常类型及优先级
1. **异常类型匹配原则**
   - 当一个异常可能属于多种异常类型（例如，`NullPointerException` 既属于 `RuntimeException` 又属于 `Exception`）时，`@ExceptionHandler` 注解会根据异常类型的继承关系来匹配最具体的异常处理方法。
2. **示例**
   - 处理 `NullPointerException` 和 `RuntimeException`：
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ErrorResponse> handleNullPointerException(NullPointerException ex) {
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "空指针异常: " + ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "运行时异常: " + ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```
   - 在这种情况下，如果抛出 `NullPointerException`，`handleNullPointerException` 方法会被优先调用，因为它是更具体的异常处理方法。

## 四、处理特定控制器或包下的异常
1. **指定控制器类**
   - 可以通过 `@ControllerAdvice` 注解的 `annotations` 属性来指定只处理带有特定注解的控制器类中的异常。例如：
```java
@ControllerAdvice(annotations = MyControllerAnnotation.class)
public class GlobalExceptionHandler {
    // 这里的异常处理方法只处理带有 MyControllerAnnotation 注解的控制器抛出的异常
}
```
2. **指定包路径**
   - 如前面提到的 `basePackages` 属性：
```java
@ControllerAdvice(basePackages = "com.example.specific.controller")
public class GlobalExceptionHandler {
    // 只处理 com.example.specific.controller 包及其子包下控制器的异常
}
```

## 五、异常处理的其他注意事项
1. **日志记录**
   - 在异常处理方法中，建议添加日志记录功能，以便更好地追踪和排查问题。例如，可以使用 `org.slf4j.Logger` 来记录异常信息：
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        logger.error("发生运行时异常", ex);
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "发生运行时异常: " + ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```
2. **异常传播与处理顺序**
   - 如果在异常处理方法中再次抛出异常，该异常会继续向上传播，可能会被更高层次的异常处理机制（如应用服务器的默认异常处理）捕获。所以在编写异常处理方法时，要谨慎考虑是否需要再次抛出异常以及如何处理异常传播。
   - 同时，要注意 `@ControllerAdvice` 类中异常处理方法的定义顺序可能会影响异常处理的结果。如果有多个 `@ExceptionHandler` 方法都能匹配某个异常类型，按照定义顺序，先匹配到的方法将被执行。

通过合理使用 `@ControllerAdvice` 和 `@ExceptionHandler` 注解，可以有效地实现 Spring Boot 应用的全局异常处理，提高应用的稳定性和用户体验。 