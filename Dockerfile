# ====== BUILD ======
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# Copia el csproj y restaura
COPY *.csproj ./
RUN dotnet restore ./BackendScout.csproj
# Copia el resto del código y publica
COPY . .
RUN dotnet publish ./BackendScout.csproj -c Release -o /app/publish

# ====== RUNTIME ======
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "BackendScout.dll"]
