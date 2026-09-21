# Kali Linux Docker VM Setup

## Overview
This setup creates a containerized Kali Linux virtual machine with SSH access and port forwarding capabilities using Docker and Docker Compose.

## Files Created

### Dockerfile
- **Base Image**: `kalilinux/kali-rolling`
- **Installed Packages**: OpenSSH server and client
- **Configuration**:
  - SSH configured to allow root login with password authentication
  - SSH keys generated automatically
  - Default root password: `kali` (change this for production)
- **Exposed Ports**: 22 (SSH), 443 (HTTPS), 80 (HTTP)
- **Startup**: Runs SSH daemon in foreground

### docker-compose.yml
- **Service**: `kali`
- **Container Name**: `kali-vm`
- **Port Mappings**:
  - `8000:443` - Host port 8000 forwards to container port 443 (HTTPS)
  - `2222:22` - Host port 2222 forwards to container port 22 (SSH)
  - `8080:80` - Host port 8080 forwards to container port 80 (HTTP)
- **Options**:
  - Interactive terminal enabled (`stdin_open`, `tty`)
  - Auto-restart on failure (`restart: unless-stopped`)

## Building and Running

### Build the Image
```bash
docker compose up -d --build
```

This command:
1. Builds the Docker image from the Dockerfile
2. Starts the container in detached mode
3. Applies all port forwarding rules

### Verify the Container is Running
```bash
docker ps
```

You should see the `kali-vm` container listed with status `Up`.

## Accessing the VM

### SSH Access
```bash
ssh root@localhost -p 2222
```
- **Username**: `root`
- **Password**: `kali`

### HTTP Access
```
http://localhost:8080
```

### HTTPS Access
```
https://localhost:8000
```

## Managing the Container

### View Logs
```bash
docker logs kali-vm
```

### Stop the Container
```bash
docker compose down
```

### Restart the Container
```bash
docker compose up -d
```

### Enter Container Shell (Without SSH)
```bash
docker exec -it kali-vm bash
```

## Security Considerations

⚠️ **Important**: The default password `kali` is hardcoded in the Dockerfile for development purposes only.

For production or sensitive use:
1. Remove the hardcoded password from the Dockerfile
2. Use SSH key-based authentication instead
3. Disable password authentication in `sshd_config`
4. Consider restricting root login

## Customization

### Change the Root Password
Edit the Dockerfile line:
```dockerfile
RUN echo 'root:kali' | chpasswd
```

Change `kali` to your desired password.

### Add More Port Mappings
Edit `docker-compose.yml` ports section:
```yaml
ports:
  - "8000:443"
  - "2222:22"
  - "8080:80"
  - "3000:3000"  # Add custom mappings here
```

### Install Additional Packages
SSH into the container and run:
```bash
apt-get update
apt-get install <package-name>
```

Or add to the Dockerfile `RUN apt-get install` line before rebuilding.

## Troubleshooting

### Authentication Fails
- Verify Docker Hub login: `docker login`
- Re-pull the base image: `docker pull kalilinux/kali-rolling`

### Cannot Connect via SSH
```bash
docker logs kali-vm
docker ps -a
```

### Port Already in Use
Change the host port in `docker-compose.yml`:
```yaml
ports:
  - "9000:443"  # Changed from 8000:443
```

Then rebuild: `docker compose up -d --build`

## Cleanup

To remove the container and image:
```bash
docker compose down
docker rmi kalilinux-kali  # Remove the built image
```
