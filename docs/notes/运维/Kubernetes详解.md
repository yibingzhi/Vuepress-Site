---
title: Kubernetes详解
createTime: 2025/08/16 17:56:41
permalink: /article/ga4jv2ik/
---
# Kubernetes详解

::: tip 保鲜说明（2026-08）
文中升级示例若出现 `kubeadm=1.24.0` 等版本号，**请替换为当前发行版支持的版本**（1.24 已 EOL）。安装/升级以 [kubernetes.io](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) 为准。
:::

## 目录
- [Kubernetes简介](#kubernetes简介)
- [核心概念](#核心概念)
- [架构设计](#架构设计)
- [安装部署](#安装部署)
- [Pod管理](#pod管理)
- [Service与网络](#service与网络)
- [存储管理](#存储管理)
- [配置管理](#配置管理)
- [集群管理](#集群管理)
- [监控运维](#监控运维)

## Kubernetes简介

### 1. 什么是Kubernetes
Kubernetes（K8s）是一个开源的容器编排平台，具有以下特点：
- **自动化部署**：自动部署、扩展和管理容器化应用
- **负载均衡**：内置负载均衡和服务发现
- **自我修复**：自动重启失败的容器、替换不健康的节点
- **水平扩展**：支持手动和自动扩展应用
- **存储编排**：自动挂载存储系统

### 2. 应用场景
- **微服务架构**：管理复杂的微服务应用
- **持续部署**：支持CI/CD流水线
- **大规模部署**：管理数千个容器
- **混合云**：跨云平台部署应用
- **边缘计算**：管理边缘节点

### 3. 与其他容器平台对比
| 特性 | Kubernetes | Docker Swarm | Apache Mesos |
|------|------------|--------------|--------------|
| 复杂度 | 高 | 低 | 中 |
| 功能丰富度 | 极高 | 中 | 高 |
| 学习曲线 | 陡峭 | 平缓 | 中等 |
| 社区支持 | 极好 | 好 | 好 |
| 企业采用 | 极高 | 中 | 中 |

## 核心概念

### 1. 基本术语

#### Pod（豆荚）
- Kubernetes的最小部署单元
- 包含一个或多个容器
- 共享网络和存储资源
- 生命周期管理

#### Node（节点）
- 运行容器的物理或虚拟机器
- 包含Kubelet、容器运行时等组件
- 分为Master节点和Worker节点

#### Namespace（命名空间）
- 虚拟集群，用于资源隔离
- 默认包含default、kube-system等
- 支持资源配额和访问控制

#### Label（标签）
- 键值对，用于标识和选择资源
- 支持复杂的标签选择器
- 用于资源分组和筛选

### 2. 资源对象

#### 工作负载资源
- **Deployment**：无状态应用部署
- **StatefulSet**：有状态应用部署
- **DaemonSet**：守护进程部署
- **Job/CronJob**：批处理任务

#### 网络资源
- **Service**：服务发现和负载均衡
- **Ingress**：HTTP/HTTPS路由
- **NetworkPolicy**：网络策略

#### 存储资源
- **PersistentVolume**：持久化存储卷
- **PersistentVolumeClaim**：存储卷声明
- **StorageClass**：存储类

#### 配置资源
- **ConfigMap**：配置数据
- **Secret**：敏感数据
- **ConfigMap**：配置映射

## 架构设计

### 1. 整体架构

#### 控制平面组件
```
API Server → etcd
     ↓
Scheduler → Controller Manager
```

#### 工作节点组件
```
Kubelet → Container Runtime
    ↓
Kube-proxy → Network Plugin
```

### 2. 组件详解

#### API Server
- 集群的统一入口
- 提供REST API接口
- 负责认证、授权和准入控制
- 支持多种客户端（kubectl、dashboard等）

#### etcd
- 分布式键值存储
- 存储集群所有数据
- 支持高可用部署
- 数据备份和恢复

#### Scheduler
- 负责Pod调度
- 考虑资源需求、亲和性、污点等
- 支持自定义调度策略
- 可扩展的调度框架

#### Controller Manager
- 维护集群状态
- 包含多种控制器
- 自动修复和扩缩容
- 故障检测和恢复

#### Kubelet
- 节点代理
- 管理Pod生命周期
- 监控容器状态
- 执行健康检查

#### Kube-proxy
- 网络代理
- 实现Service网络
- 负载均衡
- 网络策略执行

### 3. 网络架构

#### Pod网络
```
Pod1 (10.244.1.2) ←→ Pod2 (10.244.1.3)
    ↓                    ↓
Node1 (192.168.1.10)  Node2 (192.168.1.11)
```

#### Service网络
```
Service (10.96.1.10) → Pod1, Pod2, Pod3
    ↓
Load Balancer
```

## 安装部署

### 1. 单机部署（Minikube）

#### 安装Minikube
```bash
# 下载Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# 启动集群
minikube start --driver=docker

# 验证安装
kubectl get nodes
kubectl get pods --all-namespaces
```

#### 基本操作
```bash
# 启动集群
minikube start

# 停止集群
minikube stop

# 删除集群
minikube delete

# 查看状态
minikube status

# 打开Dashboard
minikube dashboard
```

### 2. 生产环境部署

#### 使用kubeadm
```bash
# 1. 安装Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# 2. 安装kubeadm、kubelet、kubectl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl

# 3. 初始化Master节点
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# 4. 配置kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 5. 安装网络插件
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

# 6. 添加Worker节点
# 在Worker节点上执行
sudo kubeadm join <master-ip>:6443 --token <token> --discovery-token-ca-cert-hash <hash>
```

#### 高可用部署
```bash
# 1. 配置负载均衡器
# 使用HAProxy或Nginx配置多个Master节点

# 2. 初始化第一个Master节点
sudo kubeadm init --control-plane-endpoint="LOAD_BALANCER_DNS:LOAD_BALANCER_PORT" \
    --upload-certs --pod-network-cidr=10.244.0.0/16

# 3. 添加其他Master节点
sudo kubeadm join <master-ip>:6443 --token <token> \
    --discovery-token-ca-cert-hash <hash> \
    --control-plane --certificate-key <certificate-key>
```

### 3. 云平台部署

#### AWS EKS
```bash
# 1. 安装eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# 2. 创建集群
eksctl create cluster --name my-cluster --region us-west-2 --nodegroup-name standard-workers \
    --node-type t3.medium --nodes 3 --nodes-min 1 --nodes-max 4

# 3. 配置kubectl
aws eks update-kubeconfig --name my-cluster --region us-west-2
```

#### Google GKE
```bash
# 1. 安装gcloud CLI
# 参考Google Cloud文档

# 2. 创建集群
gcloud container clusters create my-cluster \
    --zone us-central1-a \
    --num-nodes 3 \
    --machine-type n1-standard-2

# 3. 配置kubectl
gcloud container clusters get-credentials my-cluster --zone us-central1-a
```

## Pod管理

### 1. Pod基础

#### 创建Pod
```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

#### 部署Pod
```bash
# 应用YAML文件
kubectl apply -f pod.yaml

# 查看Pod状态
kubectl get pods

# 查看Pod详情
kubectl describe pod nginx-pod

# 查看Pod日志
kubectl logs nginx-pod

# 进入Pod
kubectl exec -it nginx-pod -- /bin/bash

# 删除Pod
kubectl delete pod nginx-pod
```

### 2. Pod生命周期

#### 生命周期阶段
```
Pending → Running → Succeeded/Failed
    ↓
ContainerCreating → ContainerRunning
```

#### 重启策略
```yaml
spec:
  restartPolicy: Always  # Always, OnFailure, Never
  containers:
  - name: nginx
    image: nginx:latest
```

#### 健康检查
```yaml
spec:
  containers:
  - name: nginx
    image: nginx:latest
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
```

### 3. 多容器Pod

#### Sidecar模式
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  containers:
  - name: web
    image: nginx:latest
    ports:
    - containerPort: 80
  - name: log-collector
    image: fluentd:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log
  volumes:
  - name: logs
    emptyDir: {}
```

#### Init容器
```yaml
spec:
  initContainers:
  - name: init-db
    image: busybox:latest
    command: ['sh', '-c', 'echo "Initializing database..." && sleep 10']
  containers:
  - name: app
    image: my-app:latest
```

## Service与网络

### 1. Service基础

#### ClusterIP Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

#### NodePort Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080
  type: NodePort
```

#### LoadBalancer Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-lb
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

### 2. Ingress

#### 基本Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

#### TLS配置
```yaml
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: tls-secret
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

### 3. 网络策略

#### 基本网络策略
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

#### 允许特定流量
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 80
```

## 存储管理

### 1. 临时存储

#### emptyDir
```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: temp-storage
      mountPath: /tmp
  volumes:
  - name: temp-storage
    emptyDir: {}
```

#### hostPath
```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: host-storage
      mountPath: /data
  volumes:
  - name: host-storage
    hostPath:
      path: /var/data
      type: Directory
```

### 2. 持久化存储

#### PersistentVolume
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /mnt/data
  storageClassName: local-storage
```

#### PersistentVolumeClaim
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: local-storage
```

#### 使用PVC
```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: persistent-storage
      mountPath: /data
  volumes:
  - name: persistent-storage
    persistentVolumeClaim:
      claimName: my-pvc
```

### 3. 存储类

#### 定义StorageClass
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
  iops: "3000"
  throughput: "125"
```

#### 动态供应
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd
```

## 配置管理

### 1. ConfigMap

#### 创建ConfigMap
```bash
# 从文件创建
kubectl create configmap app-config --from-file=config.properties

# 从字面量创建
kubectl create configmap app-config --from-literal=DB_HOST=localhost --from-literal=DB_PORT=3306

# 从YAML文件创建
kubectl apply -f configmap.yaml
```

#### ConfigMap YAML
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_url: "mysql://localhost:3306/mydb"
  api_key: "your-api-key"
  log_level: "INFO"
```

#### 使用ConfigMap
```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: DATABASE_URL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_url
    - name: API_KEY
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: api_key
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

### 2. Secret

#### 创建Secret
```bash
# 从文件创建
kubectl create secret generic db-secret --from-file=username.txt --from-file=password.txt

# 从字面量创建
kubectl create secret generic db-secret --from-literal=username=admin --from-literal=password=secret123

# 从YAML文件创建
kubectl apply -f secret.yaml
```

#### Secret YAML
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=  # base64编码
  password: c2VjcmV0MTIz  # base64编码
```

#### 使用Secret
```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: db-secret
```

### 3. 环境变量

#### 基本环境变量
```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: NODE_ENV
      value: "production"
    - name: PORT
      value: "8080"
    - name: DEBUG
      value: "false"
```

#### 从字段引用
```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name
    - name: POD_IP
      valueFrom:
        fieldRef:
          fieldPath: status.podIP
    - name: NODE_NAME
      valueFrom:
        fieldRef:
          fieldPath: spec.nodeName
```

## 集群管理

### 1. 节点管理

#### 查看节点
```bash
# 查看所有节点
kubectl get nodes

# 查看节点详情
kubectl describe node <node-name>

# 查看节点资源使用
kubectl top nodes

# 标记节点
kubectl label nodes <node-name> disktype=ssd
```

#### 节点维护
```bash
# 标记节点为不可调度
kubectl cordon <node-name>

# 排空节点（迁移Pod）
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# 恢复节点调度
kubectl uncordon <node-name>
```

### 2. 命名空间管理

#### 创建命名空间
```bash
# 命令行创建
kubectl create namespace my-namespace

# YAML文件创建
kubectl apply -f namespace.yaml
```

#### 命名空间YAML
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-namespace
  labels:
    name: my-namespace
```

#### 资源配额
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: my-namespace
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "4"
```

### 3. 集群升级

#### 升级控制平面
```bash
# 1. 升级kubeadm
sudo apt-get update
sudo apt-get install -y kubeadm=1.24.0-00

# 2. 升级控制平面
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.24.0

# 3. 升级kubelet和kubectl
sudo apt-get install -y kubelet=1.24.0-00 kubectl=1.24.0-00
sudo systemctl restart kubelet
```

#### 升级Worker节点
```bash
# 1. 排空节点
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# 2. 升级kubeadm和kubelet
sudo apt-get update
sudo apt-get install -y kubeadm=1.24.0-00 kubelet=1.24.0-00

# 3. 升级节点
sudo kubeadm upgrade node

# 4. 重启kubelet
sudo systemctl restart kubelet

# 5. 恢复节点调度
kubectl uncordon <node-name>
```

## 监控运维

### 1. 监控工具

#### Prometheus + Grafana
```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

#### 部署Prometheus
```bash
# 使用Helm安装
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack

# 查看状态
kubectl get pods -n default
```

### 2. 日志管理

#### 部署ELK Stack
```yaml
# elasticsearch.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
spec:
  serviceName: elasticsearch
  replicas: 3
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
        ports:
        - containerPort: 9200
        env:
        - name: cluster.name
          value: "k8s-logs"
        - name: node.name
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
```

#### 使用Fluentd收集日志
```yaml
# fluentd-daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: kube-system
spec:
  selector:
    matchLabels:
      name: fluentd
  template:
    metadata:
      labels:
        name: fluentd
    spec:
      containers:
      - name: fluentd
        image: fluent/fluentd-kubernetes-daemonset:v1-debian-elasticsearch
        env:
        - name: FLUENT_ELASTICSEARCH_HOST
          value: "elasticsearch.default.svc.cluster.local"
        - name: FLUENT_ELASTICSEARCH_PORT
          value: "9200"
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

### 3. 故障排查

#### 常见问题诊断
```bash
# 1. Pod无法启动
kubectl describe pod <pod-name>
kubectl logs <pod-name>

# 2. Service无法访问
kubectl get endpoints <service-name>
kubectl describe service <service-name>

# 3. 节点问题
kubectl describe node <node-name>
kubectl get events --sort-by='.lastTimestamp'

# 4. 网络问题
kubectl get networkpolicies
kubectl exec -it <pod-name> -- nslookup <service-name>
```

#### 性能调优
```bash
# 1. 查看资源使用
kubectl top nodes
kubectl top pods

# 2. 查看资源配额
kubectl describe resourcequota

# 3. 查看Pod资源限制
kubectl describe pod <pod-name> | grep -A 5 "Limits:"

# 4. 查看集群事件
kubectl get events --sort-by='.lastTimestamp'
```

## 总结

Kubernetes是一个功能强大的容器编排平台，具有以下优势：

1. **自动化管理**：自动部署、扩展、修复应用
2. **高可用性**：支持多节点部署和故障恢复
3. **可扩展性**：支持水平扩展和垂直扩展
4. **生态系统**：丰富的工具和插件支持
5. **云原生**：专为云环境设计

### 使用建议
- **学习曲线**：Kubernetes学习曲线较陡，建议循序渐进
- **最佳实践**：遵循Kubernetes最佳实践，避免反模式
- **监控运维**：建立完善的监控和日志体系
- **安全配置**：配置适当的RBAC和网络策略
- **备份恢复**：定期备份集群配置和数据

记住：Kubernetes是一个复杂的系统，需要深入理解其架构和概念，并根据实际需求进行配置和调优。
