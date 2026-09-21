FROM kalilinux/kali-rolling

RUN apt-get update && apt-get install -y \
    openssh-server \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Set up SSH
RUN mkdir -p /run/sshd
RUN echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config
RUN echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config

# Generate SSH keys
RUN ssh-keygen -A

# Set root password (change this!)
RUN echo 'root:Qwerty@123' | chpasswd

EXPOSE 22 443 80

CMD ["/usr/sbin/sshd", "-D"]
