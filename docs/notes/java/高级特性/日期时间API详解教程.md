# 日期时间API详解教程

本文档配合`com.ibz.datetime`包中的Java文件，详细介绍Java 8新的日期时间API的原理、使用方法和实际应用。

## 日期时间API基础概念

Java 8引入了全新的日期时间API，位于`java.time`包中，旨在解决旧日期时间API（如Date和Calendar类）存在的问题。新的API具有以下特点：

### 旧日期时间API的问题

1. **线程不安全**：Date和Calendar类不是线程安全的
2. **设计缺陷**：月份从0开始计数，年份需要减去1900
3. **API不一致**：不同类之间的方法命名和使用方式不一致
4. **时区处理复杂**：时区处理不够直观和方便

### 新日期时间API的优势

1. **不可变性**：所有核心类都是不可变的，线程安全
2. **清晰的API**：方法命名清晰，易于理解和使用
3. **领域驱动设计**：不同的类表示不同的时间概念
4. **良好的性能**：经过优化，性能优于旧API
5. **丰富的功能**：提供强大的日期时间计算和格式化功能

### 核心类介绍

1. **LocalDate**：表示不带时区的日期（年-月-日）
2. **LocalTime**：表示不带时区的时间（时:分:秒:纳秒）
3. **LocalDateTime**：表示不带时区的日期时间
4. **ZonedDateTime**：表示带时区的日期时间
5. **Instant**：表示时间戳（从1970-01-01T00:00:00Z开始的秒数）
6. **Duration**：表示两个时间点之间的时间量
7. **Period**：表示两个日期之间的时期

## LocalDate详解

LocalDate表示不带时区的日期，只包含年、月、日信息。

### 创建LocalDate对象

```java
// 1. 获取当前日期
LocalDate today = LocalDate.now();

// 2. 指定年月日创建
LocalDate specificDate = LocalDate.of(2023, 12, 25);

// 3. 从字符串解析
LocalDate parsedDate = LocalDate.parse("2023-12-25");

// 4. 使用自定义格式解析
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
LocalDate customParsedDate = LocalDate.parse("25/12/2023", formatter);
```

### LocalDate常用方法

```java
LocalDate date = LocalDate.of(2023, 12, 25);

// 获取年、月、日
int year = date.getYear();
int month = date.getMonthValue();
int day = date.getDayOfMonth();

// 获取星期
DayOfWeek dayOfWeek = date.getDayOfWeek();

// 日期计算
LocalDate tomorrow = date.plusDays(1);
LocalDate nextMonth = date.plusMonths(1);
LocalDate lastYear = date.minusYears(1);

// 日期比较
boolean isAfter = date.isAfter(LocalDate.now());
boolean isBefore = date.isBefore(LocalDate.now());
boolean isEqual = date.isEqual(LocalDate.now());
```

## LocalTime详解

LocalTime表示不带时区的时间，只包含时、分、秒、纳秒信息。

### 创建LocalTime对象

```java
// 1. 获取当前时间
LocalTime now = LocalTime.now();

// 2. 指定时分秒创建
LocalTime specificTime = LocalTime.of(14, 30, 45);

// 3. 从字符串解析
LocalTime parsedTime = LocalTime.parse("14:30:45");

// 4. 使用自定义格式解析
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
LocalTime customParsedTime = LocalTime.parse("02:30 PM", formatter);
```

### LocalTime常用方法

```java
LocalTime time = LocalTime.of(14, 30, 45);

// 获取时、分、秒、纳秒
int hour = time.getHour();
int minute = time.getMinute();
int second = time.getSecond();
int nano = time.getNano();

// 时间计算
LocalTime later = time.plusHours(2).plusMinutes(30);
LocalTime earlier = time.minusHours(1).minusMinutes(15);

// 时间比较
boolean isAfter = time.isAfter(LocalTime.now());
boolean isBefore = time.isBefore(LocalTime.now());
```

## LocalDateTime详解

LocalDateTime表示不带时区的日期时间，是LocalDate和LocalTime的组合。

### 创建LocalDateTime对象

```java
// 1. 获取当前日期时间
LocalDateTime now = LocalDateTime.now();

// 2. 指定日期时间创建
LocalDateTime specificDateTime = LocalDateTime.of(2023, 12, 25, 14, 30, 45);

// 3. 从LocalDate和LocalTime组合
LocalDate date = LocalDate.of(2023, 12, 25);
LocalTime time = LocalTime.of(14, 30, 45);
LocalDateTime combinedDateTime = LocalDateTime.of(date, time);

// 4. 从字符串解析
LocalDateTime parsedDateTime = LocalDateTime.parse("2023-12-25T14:30:45");

// 5. 使用自定义格式解析
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
LocalDateTime customParsedDateTime = LocalDateTime.parse("25/12/2023 14:30:45", formatter);
```

### LocalDateTime常用方法

```java
LocalDateTime dateTime = LocalDateTime.of(2023, 12, 25, 14, 30, 45);

// 获取日期和时间部分
LocalDate datePart = dateTime.toLocalDate();
LocalTime timePart = dateTime.toLocalTime();

// 日期时间计算
LocalDateTime future = dateTime.plusDays(7).plusHours(3);
LocalDateTime past = dateTime.minusDays(7).minusHours(3);

// 日期时间比较
boolean isAfter = dateTime.isAfter(LocalDateTime.now());
boolean isBefore = dateTime.isBefore(LocalDateTime.now());
```

## Instant详解

Instant表示时间戳，即从1970年1月1日00:00:00 UTC开始的秒数和纳秒数。

### 创建Instant对象

```java
// 1. 获取当前时刻
Instant now = Instant.now();

// 2. 从秒时间戳创建
Instant fromEpochSecond = Instant.ofEpochSecond(1672531200);

// 3. 从毫秒时间戳创建
Instant fromEpochMilli = Instant.ofEpochMilli(1672531200000L);

// 4. 从字符串解析
Instant parsedInstant = Instant.parse("2023-01-01T00:00:00Z");
```

### Instant常用方法

```java
Instant instant = Instant.now();

// 获取时间戳
long epochSecond = instant.getEpochSecond();
long epochMilli = instant.toEpochMilli();
int nano = instant.getNano();

// 时间计算
Instant later = instant.plusSeconds(3600).plusMillis(500);
Instant earlier = instant.minusSeconds(3600).minusMillis(500);

// 时间比较
boolean isAfter = instant.isAfter(Instant.MIN);
boolean isBefore = instant.isBefore(Instant.MAX);
```

## 时区处理

Java 8的日期时间API提供了强大的时区处理功能。

### ZonedDateTime详解

ZonedDateTime表示带时区的日期时间。

```java
// 1. 获取当前时区的日期时间
ZonedDateTime now = ZonedDateTime.now();

// 2. 获取指定时区的日期时间
ZonedDateTime tokyoTime = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));

// 3. 从LocalDateTime创建ZonedDateTime
LocalDateTime localDateTime = LocalDateTime.of(2023, 12, 25, 14, 30, 45);
ZonedDateTime shanghaiTime = localDateTime.atZone(ZoneId.of("Asia/Shanghai"));

// 4. 时区转换
ZonedDateTime utcTime = shanghaiTime.withZoneSameInstant(ZoneOffset.UTC);
ZonedDateTime parisTime = shanghaiTime.withZoneSameInstant(ZoneId.of("Europe/Paris"));
```

### OffsetDateTime详解

OffsetDateTime表示带偏移量的日期时间。

```java
// 1. 获取当前偏移日期时间
OffsetDateTime offsetNow = OffsetDateTime.now();

// 2. 指定偏移的日期时间
LocalDateTime localDateTime = LocalDateTime.of(2023, 12, 25, 14, 30, 45);
OffsetDateTime offsetDateTime = localDateTime.atOffset(ZoneOffset.of("+08:00"));

// 3. UTC偏移日期时间
OffsetDateTime utcOffsetDateTime = localDateTime.atOffset(ZoneOffset.UTC);
```

## 时间格式化

Java 8提供了强大的日期时间格式化功能。

### 内置格式器

```java
LocalDateTime dateTime = LocalDateTime.of(2023, 12, 25, 14, 30, 45);

// 使用内置格式器
String isoLocalDate = dateTime.toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
String isoLocalTime = dateTime.toLocalTime().format(DateTimeFormatter.ISO_LOCAL_TIME);
String isoLocalDateTime = dateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
```

### 预定义格式器

```java
LocalDateTime dateTime = LocalDateTime.of(2023, 12, 25, 14, 30, 45);

// 使用预定义格式器
String basicIsoDate = dateTime.format(DateTimeFormatter.BASIC_ISO_DATE);
String isoDate = dateTime.format(DateTimeFormatter.ISO_DATE);
String isoTime = dateTime.format(DateTimeFormatter.ISO_TIME);
String isoDateTime = dateTime.format(DateTimeFormatter.ISO_DATE_TIME);
```

### 本地化格式器

```java
LocalDateTime dateTime = LocalDateTime.of(2023, 12, 25, 14, 30, 45);

// 使用本地化格式器
String fullFormat = dateTime.format(
    DateTimeFormatter.ofLocalizedDateTime(FormatStyle.FULL).withLocale(Locale.CHINA));
String longFormat = dateTime.format(
    DateTimeFormatter.ofLocalizedDateTime(FormatStyle.LONG).withLocale(Locale.CHINA));
String mediumFormat = dateTime.format(
    DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).withLocale(Locale.CHINA));
String shortFormat = dateTime.format(
    DateTimeFormatter.ofLocalizedDateTime(FormatStyle.SHORT).withLocale(Locale.CHINA));
```

### 自定义格式器

```java
LocalDateTime dateTime = LocalDateTime.of(2023, 12, 25, 14, 30, 45);

// 创建自定义格式器
DateTimeFormatter customFormatter1 = DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm:ss");
DateTimeFormatter customFormatter2 = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a");
DateTimeFormatter customFormatter3 = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy 'at' HH:mm:ss");

String formatted1 = dateTime.format(customFormatter1);
String formatted2 = dateTime.format(customFormatter2);
String formatted3 = dateTime.format(customFormatter3);
```

## 时间段操作

Java 8提供了Period和Duration类来表示时间段。

### Period（日期期间）

```java
// 创建Period
Period twoYears = Period.ofYears(2);
Period threeMonths = Period.ofMonths(3);
Period tenDays = Period.ofDays(10);
Period customPeriod = Period.of(1, 6, 15); // 1年6个月15天

// 计算日期差
LocalDate startDate = LocalDate.of(2023, 1, 1);
LocalDate endDate = LocalDate.of(2023, 12, 25);
Period period = Period.between(startDate, endDate);

int years = period.getYears();
int months = period.getMonths();
int days = period.getDays();

// 在日期上应用Period
LocalDate futureDate = startDate.plus(twoYears).plus(threeMonths).plus(tenDays);
```

### Duration（时间间隔）

```java
// 创建Duration
Duration twoHours = Duration.ofHours(2);
Duration thirtyMinutes = Duration.ofMinutes(30);
Duration fortyFiveSeconds = Duration.ofSeconds(45);
Duration customDuration = Duration.of(2, ChronoUnit.HOURS) // 2小时
                            .plus(30, ChronoUnit.MINUTES)  // 加30分钟
                            .plus(45, ChronoUnit.SECONDS); // 加45秒

// 计算时间差
LocalTime startTime = LocalTime.of(9, 30, 0);
LocalTime endTime = LocalTime.of(17, 45, 30);
Duration duration = Duration.between(startTime, endTime);

long seconds = duration.getSeconds();
int nano = duration.getNano();

// 在时间上应用Duration
LocalTime futureTime = startTime.plus(twoHours).plus(thirtyMinutes).plus(fortyFiveSeconds);
```

## 时间调节器

TemporalAdjuster接口提供了调整日期时间的方法。

### 内置调节器

```java
LocalDate date = LocalDate.of(2023, 12, 25);

// 使用内置调节器
LocalDate firstDayOfMonth = date.with(TemporalAdjusters.firstDayOfMonth());
LocalDate lastDayOfMonth = date.with(TemporalAdjusters.lastDayOfMonth());
LocalDate firstDayOfNextMonth = date.with(TemporalAdjusters.firstDayOfNextMonth());
LocalDate firstDayOfYear = date.with(TemporalAdjusters.firstDayOfYear());
LocalDate lastDayOfYear = date.with(TemporalAdjusters.lastDayOfYear());

// 星期相关调节器
LocalDate nextMonday = date.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
LocalDate previousFriday = date.with(TemporalAdjusters.previous(DayOfWeek.FRIDAY));
LocalDate nextOrSameMonday = date.with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
LocalDate previousOrSameFriday = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.FRIDAY));
```

### 自定义调节器

```java
// 创建自定义调节器
TemporalAdjuster customAdjuster = temporal -> {
    LocalDate tempDate = LocalDate.from(temporal);
    // 自定义调整逻辑
    return temporal.with(tempDate.plusDays(7));
};

LocalDate date = LocalDate.of(2023, 12, 25);
LocalDate adjustedDate = date.with(customAdjuster);
```

## 实际应用场景

### 1. 生日计算

```java
public class BirthdayCalculator {
    public int calculateAge(LocalDate birthday, LocalDate currentDate) {
        return Period.between(birthday, currentDate).getYears();
    }
    
    public LocalDate getNextBirthday(LocalDate birthday, LocalDate currentDate) {
        LocalDate nextBirthday = birthday.withYear(currentDate.getYear());
        if (nextBirthday.isBefore(currentDate) || nextBirthday.isEqual(currentDate)) {
            nextBirthday = nextBirthday.plusYears(1);
        }
        return nextBirthday;
    }
    
    public long daysUntilNextBirthday(LocalDate birthday, LocalDate currentDate) {
        LocalDate nextBirthday = getNextBirthday(birthday, currentDate);
        return ChronoUnit.DAYS.between(currentDate, nextBirthday);
    }
}
```

### 2. 工作日计算

```java
public class WorkdayCalculator {
    public long calculateWorkdays(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("开始日期不能晚于结束日期");
        }
        
        long workdays = 0;
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();
            if (dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY) {
                workdays++;
            }
            currentDate = currentDate.plusDays(1);
        }
        
        return workdays;
    }
}
```

### 3. 时区转换

```java
public class TimeZoneConverter {
    public ZonedDateTime convertTimeZone(ZonedDateTime dateTime, String targetZoneId) {
        return dateTime.withZoneSameInstant(ZoneId.of(targetZoneId));
    }
    
    public Map<String, ZonedDateTime> getCurrentTimes(List<String> zoneIds) {
        Map<String, ZonedDateTime> times = new HashMap<>();
        ZonedDateTime now = ZonedDateTime.now();
        
        for (String zoneId : zoneIds) {
            times.put(zoneId, now.withZoneSameInstant(ZoneId.of(zoneId)));
        }
        
        return times;
    }
}
```

### 4. 时间戳处理

```java
public class TimestampProcessor {
    public LocalDateTime fromMillis(long millis) {
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(millis), ZoneId.systemDefault());
    }
    
    public long toMillis(LocalDateTime dateTime) {
        return dateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }
    
    public String formatTimestamp(long millis, String pattern) {
        LocalDateTime dateTime = fromMillis(millis);
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }
}
```

## 性能优化

### 1. 预编译格式器

```java
// 不好的做法：重复创建格式器
for (int i = 0; i < 10000; i++) {
    String formatted = dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
}

// 好的做法：预编译格式器
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
for (int i = 0; i < 10000; i++) {
    String formatted = dateTime.format(formatter);
}
```

### 2. 避免不必要的转换

```java
// 不必要的转换
LocalDateTime dateTime = LocalDateTime.now();
long timestamp = dateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
LocalDateTime newDateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());

// 直接使用
LocalDateTime dateTime = LocalDateTime.now();
```

## 最佳实践

### 1. 选择合适的类

```java
// 只需要日期时使用LocalDate
LocalDate birthDate = LocalDate.of(1990, 5, 15);

// 只需要时间时使用LocalTime
LocalTime meetingTime = LocalTime.of(14, 30);

// 需要日期和时间时使用LocalDateTime
LocalDateTime appointment = LocalDateTime.of(2023, 12, 25, 14, 30);

// 需要时区信息时使用ZonedDateTime
ZonedDateTime internationalMeeting = ZonedDateTime.of(
    LocalDateTime.of(2023, 12, 25, 14, 30), 
    ZoneId.of("Asia/Shanghai"));
```

### 2. 正确处理时区

```java
// 好的做法：明确指定时区
ZonedDateTime shanghaiTime = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));

// 避免：依赖系统默认时区
ZonedDateTime systemTime = ZonedDateTime.now(); // 可能导致问题
```

### 3. 使用不可变对象

```java
// 日期时间对象是不可变的，每次操作都返回新对象
LocalDate date = LocalDate.of(2023, 12, 25);
LocalDate newDate = date.plusDays(1); // 返回新对象，原对象不变
```

## 包结构说明

为了更好地组织代码，我们将日期时间API相关的类放在`com.ibz.datetime`包中：

```
src/main/java/com/ibz/datetime/
├── DateTimeBasicsDemo.java        // 日期时间API基础演示
├── DateTimeAdvancedDemo.java      // 日期时间API高级演示
├── DateTimeApplicationDemo.java   // 日期时间API实际应用演示
└── DateTimePerformanceDemo.java   // 日期时间API性能分析演示
```

## 运行示例

要运行日期时间API详解示例，使用以下命令：

```bash
# 运行日期时间API基础演示
mvn exec:java -Dexec.mainClass="com.ibz.datetime.DateTimeBasicsDemo"

# 运行日期时间API高级演示
mvn exec:java -Dexec.mainClass="com.ibz.datetime.DateTimeAdvancedDemo"

# 运行日期时间API实际应用演示
mvn exec:java -Dexec.mainClass="com.ibz.datetime.DateTimeApplicationDemo"

# 运行日期时间API性能分析演示
mvn exec:java -Dexec.mainClass="com.ibz.datetime.DateTimePerformanceDemo"
```

## 常见问题和解决方案

### 1. 解析日期时间字符串失败

```java
// 问题：格式不匹配
try {
    LocalDate date = LocalDate.parse("25/12/2023");
} catch (DateTimeParseException e) {
    // 处理解析异常
}

// 解决：使用正确的格式器
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
LocalDate date = LocalDate.parse("25/12/2023", formatter);
```

### 2. 时区转换问题

```java
// 问题：使用withZoneSameLocal而不是withZoneSameInstant
LocalDateTime localDateTime = LocalDateTime.of(2023, 12, 25, 14, 30);
ZonedDateTime shanghaiTime = localDateTime.atZone(ZoneId.of("Asia/Shanghai"));
ZonedDateTime utcTime = shanghaiTime.withZoneSameLocal(ZoneOffset.UTC); // 错误

// 解决：使用withZoneSameInstant
ZonedDateTime utcTime = shanghaiTime.withZoneSameInstant(ZoneOffset.UTC); // 正确
```

### 3. 性能问题

```java
// 问题：重复创建格式器
for (int i = 0; i < 10000; i++) {
    String formatted = dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
}

// 解决：预编译格式器
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
for (int i = 0; i < 10000; i++) {
    String formatted = dateTime.format(formatter);
}
```

## 总结

Java 8新的日期时间API是Java平台的重要改进，解决了旧API的许多问题。通过学习本教程，您应该能够：

1. **理解新日期时间API的基本概念**：掌握LocalDate、LocalTime、LocalDateTime等核心类
2. **掌握日期时间的创建和操作**：学会创建、计算和比较日期时间
3. **处理时区问题**：理解ZonedDateTime和OffsetDateTime的使用
4. **格式化和解析日期时间**：掌握各种格式化器的使用
5. **处理时间段**：学会使用Period和Duration处理时间段
6. **使用时间调节器**：掌握内置和自定义调节器的使用
7. **应用日期时间API**：在实际项目中处理生日计算、工作日计算等场景
8. **优化性能**：了解日期时间API的性能特点和优化方法

### 学习建议

1. **循序渐进**：从基础的LocalDate和LocalTime开始，逐步学习高级特性
2. **实践为主**：通过实际编码练习掌握API的使用
3. **关注时区**：在处理国际化的应用时特别注意时区问题
4. **性能优化**：了解API的性能特点，避免重复创建对象
5. **查阅文档**：参考Java官方文档获取详细的API信息

新的日期时间API是现代Java开发中不可或缺的技术，通过深入学习和实践，您将能够更好地处理各种日期时间相关的编程任务。