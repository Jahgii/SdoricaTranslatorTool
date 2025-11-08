FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build-env

WORKDIR /Source
# Copy Project
# COPY *.csproj .
COPY . ./
# Restore Project
RUN dotnet restore --verbosity detailed

# Install NodeJs
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get install -y gnupg2 && \
    wget -qO- https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y build-essential nodejs

# Build Project
RUN dotnet publish "SdoricaTranslatorTool.csproj" -c Release -o out --verbosity detailed

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /App

# Copy publish project to runtime image
COPY --from=build-env /Source/out .

ENV DOTNET_EnableDiagnostics=0
ENV ASPNETCORE_URLS=http://+:44415
EXPOSE 44415

ENTRYPOINT ["dotnet", "SdoricaTranslatorTool.dll"]