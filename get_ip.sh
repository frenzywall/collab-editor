#!/bin/bash

get_ipv4() {
    case "$(uname -s)" in
        Linux*)
            if command -v ip >/dev/null 2>&1; then
                ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -n 1
            elif command -v ifconfig >/dev/null 2>&1; then
                ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1
            else
                echo "Error: Neither 'ip' nor 'ifconfig' command found"
                exit 1
            fi
            ;;
        Darwin*)
            if command -v ifconfig >/dev/null 2>&1; then
                ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1
            else
                echo "Error: 'ifconfig' command not found"
                exit 1
            fi
            ;;
        MINGW*|CYGWIN*|MSYS*)
            if command -v ipconfig >/dev/null 2>&1; then
                ipconfig | grep -i "IPv4 Address" | head -n 1 | awk '{print $NF}'
            else
                echo "Error: 'ipconfig' command not found"
                exit 1
            fi
            ;;
        *)
            echo "Error: Unsupported operating system"
            exit 1
            ;;
    esac
}


IP_ADDRESS=$(get_ipv4)

if [ -n "$IP_ADDRESS" ]; then
    echo "Your IPv4 Address: $IP_ADDRESS"
    
    echo -e "\nAccess your services at:"
    echo "Frontend: http://$IP_ADDRESS:3000"
    echo "Backend:  http://$IP_ADDRESS:3001"
else
    echo "Error: Could not determine IPv4 address"
    exit 1
fi