# Nova Deployment Guide

This guide explains how to deploy the Nova frontend application to a Kubernetes cluster.

## Prerequisites

- Docker installed
- Access to a container registry (Docker Hub, GCR, ECR, etc.)
- kubectl configured with access to your Kubernetes cluster
- Helm 3.x installed

## Step 1: Build the Docker Image

From the frontend directory:

```bash
cd frontend

# Build the image
docker build -t <your-registry>/nova:0.1.0 .

# Tag as latest
docker tag <your-registry>/nova:0.1.0 <your-registry>/nova:latest

# Push to registry
docker push <your-registry>/nova:0.1.0
docker push <your-registry>/nova:latest
```

Example for Docker Hub:
```bash
cd frontend
docker build -t yourusername/nova:0.1.0 .
docker tag yourusername/nova:0.1.0 yourusername/nova:latest
docker push yourusername/nova:0.1.0
docker push yourusername/nova:latest
```

## Step 2: Deploy to Kubernetes with Helm

### Option A: Deploy with default values

```bash
helm install nova ./frontend/helm/nova \
  --set image.repository=<your-registry>/nova \
  --set image.tag=0.1.0
```

Or from the frontend directory:

```bash
cd frontend
helm install nova ./helm/nova \
  --set image.repository=<your-registry>/nova \
  --set image.tag=0.1.0
```

### Option B: Create custom values file

Create `custom-values.yaml`:

```yaml
image:
  repository: <your-registry>/nova
  tag: 0.1.0

replicaCount: 3

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
```

Deploy with custom values:

```bash
helm install nova ./frontend/helm/nova -f custom-values.yaml
```

## Step 3: Verify Deployment

```bash
# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# Check logs
kubectl logs -l app.kubernetes.io/name=nova

# Check health
kubectl port-forward svc/nova 8080:80
curl http://localhost:8080/health
```

## Step 4: Access the Application

The application runs on port 80 and is accessible at `/nova/` path.

### Using Port Forward (Development/Testing)

```bash
kubectl port-forward svc/nova 8080:80
```

Then visit: http://localhost:8080/nova/

### Using LoadBalancer (Production)

Update `values.yaml` or use `--set`:

```bash
helm upgrade nova ./frontend/helm/nova --set service.type=LoadBalancer
```

Get the external IP:

```bash
kubectl get svc nova
```

### Using Ingress (Production - Recommended)

Create an Ingress resource (example with nginx-ingress):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nova-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: nova.yourdomain.com
    http:
      paths:
      - path: /nova
        pathType: Prefix
        backend:
          service:
            name: nova
            port:
              number: 80
```

## Updating the Application

```bash
# Build new image with new tag (from frontend directory)
cd frontend
docker build -t <your-registry>/nova:0.2.0 .
docker push <your-registry>/nova:0.2.0

# Upgrade deployment (from project root)
helm upgrade nova ./frontend/helm/nova --set image.tag=0.2.0

# Rollback if needed
helm rollback nova
```

## Monitoring

Check application health:

```bash
# Health endpoint
kubectl port-forward svc/nova 8080:80
curl http://localhost:8080/health

# Application logs
kubectl logs -f -l app.kubernetes.io/name=nova

# Deployment status
kubectl describe deployment nova
```

## Troubleshooting

### Pods not starting

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Image pull errors

```bash
# Check if image exists in registry
docker pull <your-registry>/nova:0.1.0

# Create image pull secret if using private registry
kubectl create secret docker-registry regcred \
  --docker-server=<your-registry-server> \
  --docker-username=<your-name> \
  --docker-password=<your-password>

# Update values.yaml
imagePullSecrets:
  - name: regcred
```

### Service not accessible

```bash
# Check service
kubectl get svc nova
kubectl describe svc nova

# Check endpoints
kubectl get endpoints nova
```

## Cleanup

```bash
# Uninstall the application
helm uninstall nova

# Verify resources are deleted
kubectl get all -l app.kubernetes.io/name=nova
```
