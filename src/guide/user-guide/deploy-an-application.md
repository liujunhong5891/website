---
footerLink: /guide/user-guide/deploy-an-application
title: 部署一个应用
---
# 部署一个应用

本文档描述了将一个全新的 Kubernetes 集群注册到 Nautes 中，并在此集群上部署一个应用的过程。

## 前提条件

### 注册 GitLab 账号
GitLab 安装完成后，您需要注册一个账号，并创建 [personal access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) ，设置 access token 的权限范围：api、read_api、read_repository 和 write_repository。

如果此账号需要调用[管理集群](#注册运行时集群)的 API，您需要将账号加入到租户配置库的成员列表，并保证此账号可以向 main 分支推送代码。

### 导入证书

如果您想使用 https 协议访问 Nautes API Server，请从[安装结果](installation.md#查看安装结果)下载 ca.crt 证书，并将 ca.crt 添加到执行 API 的服务器的授信证书列表。  

### 准备服务器
您需要准备一台用于安装 Kubernetes 集群的服务器。如果您已经有一套 Kubernetes 集群（需要公网 IP），可以省略该步骤。  

下文将以阿里云为例描述如何准备服务器并安装一个 K3s 集群。

创建 ECS 云服务器，详情参考 [云服务器 ECS](https://help.aliyun.com/document_detail/25422.html)。服务器安装成功后，在服务器上安装 K3s，命令如下：
```Shell
# 根据实际情况，替换 $PUBLIC_IP 为服务器的公网 IP
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.21.14+k3s1 INSTALL_K3S_EXEC="--tls-san $PUBLIC_IP" sh -s - server --disable servicelb --disable traefik --disable metrics-server
mkdir -p ${HOME}/.kube
/bin/cp -f /etc/rancher/k3s/k3s.yaml ${HOME}/.kube/k3s-config
/bin/cp -f /etc/rancher/k3s/k3s.yaml ${HOME}/.kube/config
export KUBECONFIG=${HOME}/.kube/config
```

## 安装

以阿里云为例描述在公有云部署 Nautes 的过程，详情参考 [安装](installation.md)。

## 注册运行时集群

注册运行时集群用于把已准备好的 Kubernetes 集群托管给租户管理集群，并由租户管理集群初始化集群的相关配置。初始化完成后的集群可以作为承载应用的运行时环境。

注册运行时集群支持的集群形态包括物理集群和虚拟集群。

当您的应用的运行时环境需要更高的性能、隔离性和可靠性时，建议使用[物理集群](#注册物理集群)。而对于其他环境，例如开发测试环境和试用环境等，可以使用[虚拟集群](#注册虚拟集群)。

### 注册物理集群
1. 将命令行程序的代码库克隆到本地。
```Shell
git clone https://github.com/nautes-labs/cli.git
```

2. 替换位于相对路径 `examples/demo-cluster-physical-worker.yaml` 下物理集群属性模板的变量，包括 `$suffix`、`$api-server` 和 `$kubeconfig`。
```Shell
# 查看物理集群的 kubeconfig
cat ${HOME}/.kube/config
```

```yaml
# 物理集群属性模板
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Cluster
spec:
  # 集群名称
  name: "cluster-demo-$suffix"
  # 集群的 API SERVER URL。使用物理集群的 server 地址替换该变量
  apiServer: "$api-server"
  # 集群种类：目前只支持 kubernetes
  clusterKind: "kubernetes"
  # 集群类型：virtual或physical
  clusterType: "physical"
  # 集群用途：host或worker
  usage: "worker"
  # argocd 域名，使用物理集群的 IP 替换变量 $cluster_ip
  argocdHost: "argocd.cluster-demo-$suffix.$cluster_ip.nip.io"
  # traefik 配置：物理集群才有此属性
  traefik:
    httpNodePort: "30080"
    httpsNodePort: "30443"
  # 集群的 kubeconfig 文件内容：使用物理集群的 kubeconfig 替换该变量
  kubeconfig: |
    "$kubeconfig"
```

替换变量后的物理集群属性示例如下：
```yaml
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Cluster
spec:
  name: "host-worker-aliyun-0412"
  apiServer: "https://8.217.50.114:6443"
  clusterKind: "kubernetes"
  clusterType: "physical"
  usage: "worker"
  argocdHost: "argocd.host-worker-aliyun-0412.8.217.50.114.nip.io"
  traefik:
    httpNodePort: "30080"
    httpsNodePort: "30443"
  kubeconfig: |
    apiVersion: v1
    clusters:
    - cluster:
        certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJlRENDQVIyZ0F3SUJBZ0lCQURBS0JnZ3Foa2pPUFFRREFqQWpNU0V3SHdZRFZRUUREQmhyTTNNdGMyVnkKZG1WeUxXTmhRREUyT0RFeU9UQXdPVFV3SGhjTk1qTXdOREV5TURrd01UTTFXaGNOTXpNd05EQTVNRGt3TVRNMQpXakFqTVNFd0h3WURWUVFEREJock0zTXRjMlZ5ZG1WeUxXTmhRREUyT0RFeU9UQXdPVFV3V1RBVEJnY3Foa2pPClBRSUJCZ2dxaGtqT1BRTUJCd05DQUFSMzRuTjVPWWhxb3MrekV1YXZsVDRleXE4ZFRVZ2pxcUdoN2Z6NkpMZEMKem1FN0cwZjE5K0hLcEw5cU1tSXVBaStRelBZZFNzWGJpR20rNjR0R0NuVkRvMEl3UURBT0JnTlZIUThCQWY4RQpCQU1DQXFRd0R3WURWUjBUQVFIL0JBVXdBd0VCL3pBZEJnTlZIUTRFRmdRVUp0WVUxbkNvTXNNYWpVeUJGN3RVCndjZWJ6TW93Q2dZSUtvWkl6ajBFQXdJRFNRQXdSZ0loQU9hR2pWNlRpK2o1Yy9kWlV5a1pERml0OU9DdkFmZjEKWjJSVUJ6TkJTOUlhQWlFQTB1bzM2YUVGRnkvdWQ0eHREZnNkWmhYWmZOaXQ3c2N4SXREa1k5STlQUkU9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
        server: https://127.0.0.1:6443
      name: default
    contexts:
    - context:
        cluster: default
        user: default
      name: default
    current-context: default
    kind: Config
    preferences: {}
    users:
    - name: default
      user:
        client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJrVENDQVRlZ0F3SUJBZ0lJSjYyRGdFT3JiM3d3Q2dZSUtvWkl6ajBFQXdJd0l6RWhNQjhHQTFVRUF3d1kKYXpOekxXTnNhV1Z1ZEMxallVQXhOamd4TWprd01EazFNQjRYRFRJek1EUXhNakE1TURFek5Wb1hEVEkwTURReApNVEE1TURFek5Wb3dNREVYTUJVR0ExVUVDaE1PYzNsemRHVnRPbTFoYzNSbGNuTXhGVEFUQmdOVkJBTVRESE41CmMzUmxiVHBoWkcxcGJqQlpNQk1HQnlxR1NNNDlBZ0VHQ0NxR1NNNDlBd0VIQTBJQUJJNnlLRlBKNENmS25BUFkKQ0Q5ZFVtZlZ5ekR2aFpEQUdhU1lYODVoWWRYZ0NKdmxHRmlad3dGN2ExKzEzdlQ5ZjE2MUJwSGhKTm9mYi9oeAozUVo1MWs2alNEQkdNQTRHQTFVZER3RUIvd1FFQXdJRm9EQVRCZ05WSFNVRUREQUtCZ2dyQmdFRkJRY0RBakFmCkJnTlZIU01FR0RBV2dCVHhiVTM2eC9iMnl3WU14SmpuUjF5L2w2cHZCREFLQmdncWhrak9QUVFEQWdOSUFEQkYKQWlFQS9rZ3FCOGJLZnNLSGNmaDBUSFQ2bTZNLzdrMzlNWmFGYlVCaE9GTzVDSW9DSURiRWNaeUxkc055R3lVVQpSTDl5K0hHcVJ3b1FTWGhOa1NrQjhlbkpsQTEzCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0KLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJkekNDQVIyZ0F3SUJBZ0lCQURBS0JnZ3Foa2pPUFFRREFqQWpNU0V3SHdZRFZRUUREQmhyTTNNdFkyeHAKWlc1MExXTmhRREUyT0RFeU9UQXdPVFV3SGhjTk1qTXdOREV5TURrd01UTTFXaGNOTXpNd05EQTVNRGt3TVRNMQpXakFqTVNFd0h3WURWUVFEREJock0zTXRZMnhwWlc1MExXTmhRREUyT0RFeU9UQXdPVFV3V1RBVEJnY3Foa2pPClBRSUJCZ2dxaGtqT1BRTUJCd05DQUFTbnNEVkxLTU4xTWl4cHAwclRMRTBOVGdjamFRWFhmUmZmOThiOTRqd1gKYjRPNVh1aCtFclZwZ3BjamxRYjVZKzM0T1NwaG03TnVXWlA2OHBkUWhMTW5vMEl3UURBT0JnTlZIUThCQWY4RQpCQU1DQXFRd0R3WURWUjBUQVFIL0JBVXdBd0VCL3pBZEJnTlZIUTRFRmdRVThXMU4rc2YyOXNzR0RNU1k1MGRjCnY1ZXFid1F3Q2dZSUtvWkl6ajBFQXdJRFNBQXdSUUloQUtXSStXQ2wwRFlJME5oVDBzbDkwSVRHRW05V2EyaE0KQXV4UXkrcDVUcGpzQWlBdWxFd0NkK2lWYXNVY2VHa2I4WU81dlduQitaTVJmSU1rYWRHSGhpSmlrdz09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
        client-key-data: LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IY0NBUUVFSU5ZZFVkaER2SlFXcVNSRzR0d3gzQ2I4amhnck1HZlVOMG1uajV5dTRWZ1RvQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFanJJb1U4bmdKOHFjQTlnSVAxMVNaOVhMTU8rRmtNQVpwSmhmem1GaDFlQUltK1VZV0puRApBWHRyWDdYZTlQMS9YclVHa2VFazJoOXYrSEhkQm5uV1RnPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo=
```

3. 下载 [命令行工具](https://github.com/nautes-labs/cli/releases/tag/v0.2.0)，执行以下命令以注册物理集群。

```Shell
# examples/demo-cluster-host.yaml 指在代码库中模板文件的相对路径
# gitlab-access-token 指 GitLab 访问令牌
# api-server-address 指 Nautes API Server 的访问地址
nautes apply -f examples/demo-cluster-physical-worker.yaml -t $gitlab-access-token -s $api-server-address
```

### 注册虚拟集群
1. 将命令行程序的代码库克隆到本地。
```Shell
git clone https://github.com/nautes-labs/cli.git
```
2. 替换位于相对路径 `examples/demo-cluster-host.yaml` 下的宿主集群属性模板的变量，包括 `$suffix`、`$api-server` 和 `$kubeconfig`。
```Shell
# 查看宿主集群的 kubeconfig
cat ${HOME}/.kube/config
```

```yaml
# 宿主集群
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Cluster
spec:
  # 集群名称
  name: "cluster-demo-$suffix"
  # 集群的 API SERVER URL，使用宿主集群的 server 地址替换该变量
  apiServer: "$api-server"
  # 集群种类：目前只支持 kubernetes
  clusterKind: "kubernetes"
  # 集群类型：virtual或physical
  clusterType: "physical"
  # 集群用途：host或worker
  usage: "host"
  # traefik 配置
  traefik:
    httpNodePort: "30080"
    httpsNodePort: "30443"
  # 集群的 kubeconfig 文件内容，使用宿主集群的 kubeconfig 替换该变量
  kubeconfig: |
    "$kubeconfig"
```
替换变量后的宿主集群属性示例如下：
```yaml
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Cluster
spec:
  name: "host-aliyun-114"
  apiServer: "https://8.217.50.114:6443"
  clusterKind: "kubernetes"
  clusterType: "physical"
  usage: "host"
  traefik:
    httpNodePort: "30080"
    httpsNodePort: "30443"
  kubeconfig: |
    apiVersion: v1
    clusters:
    - cluster:
        certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJlRENDQVIyZ0F3SUJBZ0lCQURBS0JnZ3Foa2pPUFFRREFqQWpNU0V3SHdZRFZRUUREQmhyTTNNdGMyVnkKZG1WeUxXTmhRREUyT0RFeU9UQXdPVFV3SGhjTk1qTXdOREV5TURrd01UTTFXaGNOTXpNd05EQTVNRGt3TVRNMQpXakFqTVNFd0h3WURWUVFEREJock0zTXRjMlZ5ZG1WeUxXTmhRREUyT0RFeU9UQXdPVFV3V1RBVEJnY3Foa2pPClBRSUJCZ2dxaGtqT1BRTUJCd05DQUFSMzRuTjVPWWhxb3MrekV1YXZsVDRleXE4ZFRVZ2pxcUdoN2Z6NkpMZEMKem1FN0cwZjE5K0hLcEw5cU1tSXVBaStRelBZZFNzWGJpR20rNjR0R0NuVkRvMEl3UURBT0JnTlZIUThCQWY4RQpCQU1DQXFRd0R3WURWUjBUQVFIL0JBVXdBd0VCL3pBZEJnTlZIUTRFRmdRVUp0WVUxbkNvTXNNYWpVeUJGN3RVCndjZWJ6TW93Q2dZSUtvWkl6ajBFQXdJRFNRQXdSZ0loQU9hR2pWNlRpK2o1Yy9kWlV5a1pERml0OU9DdkFmZjEKWjJSVUJ6TkJTOUlhQWlFQTB1bzM2YUVGRnkvdWQ0eHREZnNkWmhYWmZOaXQ3c2N4SXREa1k5STlQUkU9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
        server: https://127.0.0.1:6443
      name: default
    contexts:
    - context:
        cluster: default
        user: default
      name: default
    current-context: default
    kind: Config
    preferences: {}
    users:
    - name: default
      user:
        client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJrVENDQVRlZ0F3SUJBZ0lJSjYyRGdFT3JiM3d3Q2dZSUtvWkl6ajBFQXdJd0l6RWhNQjhHQTFVRUF3d1kKYXpOekxXTnNhV1Z1ZEMxallVQXhOamd4TWprd01EazFNQjRYRFRJek1EUXhNakE1TURFek5Wb1hEVEkwTURReApNVEE1TURFek5Wb3dNREVYTUJVR0ExVUVDaE1PYzNsemRHVnRPbTFoYzNSbGNuTXhGVEFUQmdOVkJBTVRESE41CmMzUmxiVHBoWkcxcGJqQlpNQk1HQnlxR1NNNDlBZ0VHQ0NxR1NNNDlBd0VIQTBJQUJJNnlLRlBKNENmS25BUFkKQ0Q5ZFVtZlZ5ekR2aFpEQUdhU1lYODVoWWRYZ0NKdmxHRmlad3dGN2ExKzEzdlQ5ZjE2MUJwSGhKTm9mYi9oeAozUVo1MWs2alNEQkdNQTRHQTFVZER3RUIvd1FFQXdJRm9EQVRCZ05WSFNVRUREQUtCZ2dyQmdFRkJRY0RBakFmCkJnTlZIU01FR0RBV2dCVHhiVTM2eC9iMnl3WU14SmpuUjF5L2w2cHZCREFLQmdncWhrak9QUVFEQWdOSUFEQkYKQWlFQS9rZ3FCOGJLZnNLSGNmaDBUSFQ2bTZNLzdrMzlNWmFGYlVCaE9GTzVDSW9DSURiRWNaeUxkc055R3lVVQpSTDl5K0hHcVJ3b1FTWGhOa1NrQjhlbkpsQTEzCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0KLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJkekNDQVIyZ0F3SUJBZ0lCQURBS0JnZ3Foa2pPUFFRREFqQWpNU0V3SHdZRFZRUUREQmhyTTNNdFkyeHAKWlc1MExXTmhRREUyT0RFeU9UQXdPVFV3SGhjTk1qTXdOREV5TURrd01UTTFXaGNOTXpNd05EQTVNRGt3TVRNMQpXakFqTVNFd0h3WURWUVFEREJock0zTXRZMnhwWlc1MExXTmhRREUyT0RFeU9UQXdPVFV3V1RBVEJnY3Foa2pPClBRSUJCZ2dxaGtqT1BRTUJCd05DQUFTbnNEVkxLTU4xTWl4cHAwclRMRTBOVGdjamFRWFhmUmZmOThiOTRqd1gKYjRPNVh1aCtFclZwZ3BjamxRYjVZKzM0T1NwaG03TnVXWlA2OHBkUWhMTW5vMEl3UURBT0JnTlZIUThCQWY4RQpCQU1DQXFRd0R3WURWUjBUQVFIL0JBVXdBd0VCL3pBZEJnTlZIUTRFRmdRVThXMU4rc2YyOXNzR0RNU1k1MGRjCnY1ZXFid1F3Q2dZSUtvWkl6ajBFQXdJRFNBQXdSUUloQUtXSStXQ2wwRFlJME5oVDBzbDkwSVRHRW05V2EyaE0KQXV4UXkrcDVUcGpzQWlBdWxFd0NkK2lWYXNVY2VHa2I4WU81dlduQitaTVJmSU1rYWRHSGhpSmlrdz09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
        client-key-data: LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IY0NBUUVFSU5ZZFVkaER2SlFXcVNSRzR0d3gzQ2I4amhnck1HZlVOMG1uajV5dTRWZ1RvQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFanJJb1U4bmdKOHFjQTlnSVAxMVNaOVhMTU8rRmtNQVpwSmhmem1GaDFlQUltK1VZV0puRApBWHRyWDdYZTlQMS9YclVHa2VFazJoOXYrSEhkQm5uV1RnPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo=
```

3. 下载 [命令行工具](https://github.com/nautes-labs/cli/releases/tag/v0.2.0)，执行以下命令，将注册宿主集群。

```Shell
nautes apply -f examples/demo-cluster-host.yaml -t $gitlab-access-token -s $api-server-address
```

4. 替换位于相对路径 `examples/demo-cluster-virtual-worker.yaml` 下的虚拟集群属性模板的变量，包括 `$suffix`、`$api-server`、`$host-cluster` 和 `$api-server-port`。
```yaml
# 虚拟集群
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Cluster
spec:
  # 集群名称
  name: "cluster-demo-$suffix"
  # 集群的 API SERVER URL，使用 https://$hostcluster-ip:$api-server-port 格式替换参数，其中 $hostcluster-ip 指宿主集群的IP，$api-server-port 指虚拟集群的 API Server 端口
  apiServer: "$api-server"
  # 集群种类：目前只支持 kubernetes
  clusterKind: "kubernetes"
  # 集群类型：virtual或physical
  clusterType: "virtual"
  # 集群用途：host或worker
  usage: "worker"
  # 所属宿主集群：virtual类型集群才有此属性，使用宿主集群的名称替换参数
  hostCluster: "$host-cluster"
  # argocd 域名，使用宿主集群的IP替换变量 $cluster_ip
  argocdHost: "argocd.cluster-demo-$suffix.$cluster_ip.nip.io"
  # 虚拟集群配置：virtual类型集群才有此属性
  vcluster: 
    # API SERVER 端口号
    httpsNodePort: "$api-server-port"
```
替换变量后的虚拟集群属性示例如下：
```yaml
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Cluster
spec:
  name: "vcluster-aliyun-0412"
  apiServer: "https://8.217.50.114:31456"
  clusterKind: "kubernetes"
  clusterType: "virtual"
  usage: "worker"
  hostCluster: "host-aliyun-114"
  argocdHost: "argocd.vcluster-aliyun-0412.8.217.50.114.nip.io"
  vcluster: 
    httpsNodePort: "31456"
```

5. 执行以下命令，将注册该虚拟集群。

```Shell
nautes apply -f examples/demo-cluster-virtual-worker.yaml -t $gitlab-access-token -s $api-server-address
```
## 准备运行环境

准备运行环境是指在运行时集群中初始化一个用于部署产品的基础环境，包括 namespace、serviceAccount、secret 等资源。

下文将描述通过命令行提交创建运行环境的相关实体，包括产品、项目、代码库、环境以及部署运行时等。

1. 将命令行程序的代码库克隆到本地。
```Shell
git clone https://github.com/nautes-labs/cli.git
```

2. 替换位于相对路径 `examples/demo-product.yaml` 下运行环境属性模板的变量，包括 `$suffix`，`$runtime-cluster`。
```yaml
# 产品
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Product
spec:
  name: demo-$suffix
  git:
    gitlab:
      # 产品名称
      name: demo-$suffix
      # 产品路径
      path: demo-$suffix
      visibility: private
      description: demo-$suffix
      parentID: 0
---
# 环境
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Environment
spec:
  # 环镜名称
  name: env-demo-$suffix
  # 环境的所属产品
  product: demo-$suffix
  # 环境关联的运行时集群
  cluster: $runtime-cluster
  # 环境类型
  envType: dev
---
# 项目
apiVersion: "nautes.resource.nautes.io/v1alpha1"
kind: Project
spec:
  # 项目名称
  name: project-demo-$suffix
  # 项目的所属产品
  product: demo-$suffix
  language: golang
---
# 代码库
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: CodeRepo
spec:
  # 代码库名称
  name: coderepo-demo-$suffix
  codeRepoProvider: gitlab
  deploymentRuntime: true
  pipelineRuntime: false
  # 代码库的所属产品
  product: demo-$suffix
  # 代码库的所属项目
  project: project-demo-$suffix
  webhook:
    events: ["push_events"]
    isolation: shared
  git:
    gitlab:
      # 代码库的名称
      name: coderepo-demo-$suffix
      # 代码库的路径
      path: coderepo-demo-$suffix 
      # 代码库的可见性，例如：private、public
      visibility: private
      description: coderepo-demo-$suffix 
---
# 部署运行时
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: DeploymentRuntime
spec:
  # 部署运行时的名称
  name: dr-demo-$suffix
  # 承载产品的部署运行环境的目标集群
  destination: env-demo-$suffix
  manifestsource:
    # 部署运行时监听的代码库
    codeRepo: coderepo-demo-$suffix
    # 部署运行时监听的代码库的相对路径
    path: deployments
    # 部署运行时监听的代码库版本或代码库分支
    targetRevision: main
  # 部署运行时的所属产品
  product: demo-$suffix
  # 部署运行时关联的项目
  projectsRef:
    - project-demo-$suffix
```

替换变量后的运行环境属性示例如下：
```yaml
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Product
spec:
  name: demo-0412
  git:
    gitlab:
      name: demo-0412
      path: demo-0412
      visibility: private
      description: demo-0412
      parentID: 0
---
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: Environment
spec:
  name: env-demo-0412
  product: demo-0412
  cluster: host-worker-aliyun-0412
  envType: dev
---
apiVersion: "nautes.resource.nautes.io/v1alpha1"
kind: Project
spec:
  name: project-demo-0412
  product: demo-0412
  language: golang
---
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: CodeRepo
spec:
  name: coderepo-demo-0412
  codeRepoProvider: gitlab
  deploymentRuntime: true
  pipelineRuntime: false
  product: demo-0412
  project: project-demo-0412
  webhook:
    events: ["push_events"]
    isolation: shared
  git:
    gitlab:
      name: coderepo-demo-0412
      path: coderepo-demo-0412 
      visibility: private
      description: coderepo-demo-0412 
---
apiVersion: nautes.resource.nautes.io/v1alpha1
kind: DeploymentRuntime
spec:
  name: dr-demo-0412
  destination: env-demo-0412
  manifestsource:
    codeRepo: coderepo-demo-0412
    path: deployments
    targetRevision: main
  product: demo-0412
  projectsRef:
    - project-demo-0412
```

3. 下载 [命令行工具](https://github.com/nautes-labs/cli/releases/tag/v0.2.0)，执行以下命令，以准备运行环境 。
```Shell
nautes apply -f examples/demo-product.yaml -t $gitlab-access-token -s $api-server-address
```
## 部署
将 Kubernetes 资源清单提交至产品的代码库。

1. 克隆部署示例的代码库到本地。
```Shell
git clone https://github.com/lanbingcloud/demo-user-deployments.git
```

2. 修改本地代码库中 Ingress 资源的域名：/deployment/test/devops-sample-svc.yaml
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ks-sample-dev
spec:
  rules:
  # 将 $cluster-ip 替换为运行时集群的公网 IP 
  - host: devops-sample.$cluster-ip.nip.io
    http:
      paths:
      ...
```
3. 推送 Kubernetes 资源清单至产品的代码库。
```Shell
# 替换变量 $deployment-manifest-repo 为存储 Kubernetes 资源清单的代码库
git remote set-url origin $deployment-manifest-repo
# 推送 Kubernetes 资源清单至产品的代码库
git add .
git commit -m '提交 Kubernetes 资源清单'
git push origin main
```
## 查看部署结果

部署成功后，使用浏览器访问 `http://devops-sample.$cluster-ip.nip.io` ，可以访问示例应用的 Web 界面。

您也可以通过 ArgoCD 控制台查看应用的部署结果，并且只能查看和管理被授权产品的相关资源。

访问安装在运行时集群中的 [ArgoCD 控制台](installation.md#查看安装结果)，点击 LOG IN VIA DEX 进行统一认证，如果在当前浏览器会话中未登录过 GitLab，那么需要填写您的 GitLab 账号密码进行登录。登录成功后页面会自动跳转到 ArgoCD 控制台。

在 ArgoCD 控制台中将呈现被授权产品相关的 ArgoCD applications，您可以查看和管理相关资源。点击某个 ArgoCD application 卡片，将呈现该 application 的资源清单，您可以查看资源的 YAML、事件、日志等，并对资源执行同步、重启、删除等操作。点击 ArgoCD 控制台左侧菜单栏的“设置”，还可以查看被授权产品相关的 ArgoCD projects。