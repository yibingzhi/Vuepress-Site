# Spring Boot 统一接口封装笔记

## 一、目的
在 Spring Boot 应用开发中，对接口进行统一封装具有重要意义。它能够规范接口的响应格式，方便前端开发者对接，同时增强接口的可维护性与扩展性，提高整个系统的稳定性和可靠性。

## 二、统一响应实体类设计
1. **基本结构**
   - 创建一个通用的响应实体类，例如 `ApiResponse`。该类应包含以下基本属性：
     - **状态码（code）**：用于表示接口请求的处理结果状态，如成功为 `200`，常见错误可分别定义不同的状态码，如参数错误 `400`、未授权 `401`、服务器内部错误 `500` 等。
     - **消息（message）**：对接口请求处理结果的简要描述，当接口出现异常或特定情况时，可以在此处给出相应的提示信息，方便前端开发者理解。
     - **数据（data）**：用于存放接口请求成功后返回的实际业务数据。如果接口只是执行一些操作而无具体数据返回，该字段可为 `null`。
   - 示例代码：
```java
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;

    // 生成对应的 getters 和 setters
    public ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}
```

## 三、接口响应封装工具类
1. **成功响应方法**
   - 创建一个工具类，例如 `ApiResponseUtil`，其中定义生成成功响应的静态方法。该方法接受业务数据作为参数，返回封装好的 `ApiResponse` 对象，状态码设置为 `200`，消息可设置为默认的成功提示，如 "请求成功"。
   - 示例代码：
```java
public class ApiResponseUtil {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "请求成功", data);
    }
}
```
2. **错误响应方法**
   - 针对不同类型的错误，在工具类中定义相应的错误响应方法。例如，定义参数错误响应方法，接受错误消息作为参数，返回状态码为 `400` 的 `ApiResponse` 对象；定义服务器内部错误响应方法，返回状态码为 `500` 的 `ApiResponse` 对象等。
   - 示例代码：
```java
public class ApiResponseUtil {
    //...
    public static <T> ApiResponse<T> badRequest(String message) {
        return new ApiResponse<>(400, message, null);
    }

    public static <T> ApiResponse<T> internalServerError(String message) {
        return new ApiResponse<>(500, message, null);
    }
}
```

## 四、在控制器中应用接口封装
1. **修改返回值类型**
   - 在控制器的接口方法中，将原本直接返回业务数据或其他类型的返回值修改为返回 `ApiResponse` 类型。
   - 示例：
```java
@RestController
public class UserController {
    @GetMapping("/users/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user!= null) {
            return ApiResponseUtil.success(user);
        } else {
            return ApiResponseUtil.badRequest("用户不存在");
        }
    }
}
```

## 五、全局异常处理与接口封装结合
1. **异常处理类中使用接口封装**
   - 在全局异常处理类（使用 `@ControllerAdvice` 和 `@ExceptionHandler` 注解的类）中，当捕获到异常时，不再直接返回原始的错误信息，而是使用接口封装工具类生成相应的错误响应 `ApiResponse` 对象并返回。
   - 示例：
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<?>> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>(ApiResponseUtil.internalServerError(ex.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## 六、接口版本控制与接口封装
1. **版本号参数传递**
   - 如果应用存在接口版本控制需求，可以在接口请求中添加版本号参数（如 `v` 参数）。在控制器方法中，根据版本号参数来处理不同版本的业务逻辑，并在接口封装时考虑版本差异对响应的影响。例如，不同版本可能返回的数据结构略有不同，但都通过 `ApiResponse` 进行统一包装。
   - 示例：
```java
@RestController
public class ProductController {
    @GetMapping("/products")
    public ApiResponse<List<Product>> getProducts(@RequestParam(defaultValue = "1.0") String v) {
        if ("1.0".equals(v)) {
            List<Product> products = productService.getProductsV1();
            return ApiResponseUtil.success(products);
        } else if ("2.0".equals(v)) {
            List<ProductV2> productsV2 = productService.getProductsV2();
            return ApiResponseUtil.success((List<Product>) (List<?>) productsV2); // 假设 ProductV2 继承自 Product，这里进行类型转换处理
        } else {
            return ApiResponseUtil.badRequest("不支持的版本号");
        }
    }
}
```

通过以上步骤，可以在 Spring Boot 应用中实现较为完善的统一接口封装，提高接口的规范性和系统的整体质量，方便前后端开发协作以及后续的维护与扩展工作。 