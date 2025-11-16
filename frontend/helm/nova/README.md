# Nova Helm Chart

This Helm chart deploys the Nova frontend application to Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Docker image built and pushed to your registry

## Building the Docker Image

From the frontend directory:

```bash
cd frontend
# Build the Docker image
docker build -t <your-registry>/nova:latest .

# Push to your registry
docker push <your-registry>/nova:latest
```

## Installing the Chart

From the project root directory:

```bash
# Install with default values
helm install nova ./frontend/helm/nova

# Install with custom values
helm install nova ./frontend/helm/nova -f custom-values.yaml

# Install with specific image
helm install nova ./frontend/helm/nova \
  --set image.repository=<your-registry>/nova \
  --set image.tag=latest
```

Or from the frontend directory:

```bash
cd frontend
helm install nova ./helm/nova \
  --set image.repository=<your-registry>/nova \
  --set image.tag=latest
```

## Upgrading the Chart

```bash
helm upgrade nova ./frontend/helm/nova
```

## Uninstalling the Chart

```bash
helm uninstall nova
```

## Configuration

The following table lists the configurable parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `2` |
| `image.repository` | Image repository | `nova` |
| `image.tag` | Image tag | `latest` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `80` |
| `resources.limits.cpu` | CPU limit | `200m` |
| `resources.limits.memory` | Memory limit | `256Mi` |
| `resources.requests.cpu` | CPU request | `100m` |
| `resources.requests.memory` | Memory request | `128Mi` |
| `autoscaling.enabled` | Enable HPA | `false` |
| `autoscaling.minReplicas` | Minimum replicas | `2` |
| `autoscaling.maxReplicas` | Maximum replicas | `10` |

## Accessing the Application

The application is served at the `/nova/` path. After installation, follow the instructions in the NOTES to access the application.

For ClusterIP service (default):
```bash
kubectl port-forward svc/nova 8080:80
# Then visit http://localhost:8080/nova/
```

## Health Checks

The application includes a health check endpoint at `/health` which is used for liveness and readiness probes.
