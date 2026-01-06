import Set "mo:core/Set";
import Map "mo:core/Map";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";
import Debug "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Migration "migration";

(with migration = Migration.run)
actor WireGuardManager {
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
  };

  var userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type WireGuardPeer = {
    id : Text;
    publicKey : Text;
    allowedIps : Text;
    createdAt : Time.Time;
    lastSeen : ?Time.Time;
    dataUsage : Nat;
  };

  public type ProtonVpnCredentials = {
    username : Text;
    password : Text;
  };

  public type ProtonVpnServer = {
    id : Text;
    name : Text;
    country : Text;
    load : Nat;
    is10Gbps : Bool;
    supportsWireGuard : Bool;
  };

  public type ServerStatus = {
    isRunning : Bool;
    activePeers : Nat;
    totalDataUsage : Nat;
    cpuLoad : Nat;
    memoryUsage : Nat;
    networkSpeed : Nat;
    tunnelHealth : Text;
  };

  var wireGuardPeers = Map.empty<Text, WireGuardPeer>();
  var protonVpnCredentials : ?ProtonVpnCredentials = null;
  var serverStatus : ServerStatus = {
    isRunning = false;
    activePeers = 0;
    totalDataUsage = 0;
    cpuLoad = 0;
    memoryUsage = 0;
    networkSpeed = 0;
    tunnelHealth = "disconnected";
  };

  public shared ({ caller }) func addWireGuardPeer(peer : WireGuardPeer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can add peers");
    };
    wireGuardPeers.add(peer.id, peer);
  };

  public shared ({ caller }) func removeWireGuardPeer(peerId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can remove peers");
    };
    wireGuardPeers.remove(peerId);
  };

  public query ({ caller }) func getWireGuardPeers() : async [WireGuardPeer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view peers");
    };
    wireGuardPeers.values().toArray();
  };

  public shared ({ caller }) func saveProtonVpnCredentials(credentials : ProtonVpnCredentials) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can save credentials");
    };
    protonVpnCredentials := ?credentials;
  };

  public query ({ caller }) func getProtonVpnCredentials() : async ?ProtonVpnCredentials {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view credentials");
    };
    protonVpnCredentials;
  };

  public query ({ caller }) func getServerStatus() : async ServerStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view server status");
    };
    serverStatus;
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    let managementCanister = Principal.fromText("aaaaa-aa");
    let selfPrincipal = Principal.fromActor(WireGuardManager);

    if (caller != managementCanister and caller != selfPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Transform function can only be called by the management canister or admins");
    };

    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchProtonVpnServers() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can fetch servers");
    };
    await OutCall.httpGetRequest("https://api.protonvpn.ch/vpn/logicals", [], transform);
  };

  public shared ({ caller }) func startWireGuardService() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can start service");
    };
    serverStatus := {
      serverStatus with
      isRunning = true;
      tunnelHealth = "connected";
    };
  };

  public shared ({ caller }) func stopWireGuardService() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can stop service");
    };
    serverStatus := {
      serverStatus with
      isRunning = false;
      tunnelHealth = "disconnected";
    };
  };

  public shared ({ caller }) func restartWireGuardService() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can restart service");
    };
    serverStatus := {
      serverStatus with
      isRunning = true;
      tunnelHealth = "restarting";
    };
  };

  public type InstallationScript = {
    content : Text;
    createdAt : Time.Time;
    lastModified : Time.Time;
  };

  var installationScript : ?InstallationScript = null;

  public shared ({ caller }) func saveInstallationScript(script : InstallationScript) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can save installation scripts");
    };
    installationScript := ?script;
  };

  public query ({ caller }) func getInstallationScript() : async ?InstallationScript {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view installation scripts");
    };
    installationScript;
  };

  public type DeploymentGuide = {
    content : Text;
    createdAt : Time.Time;
    lastModified : Time.Time;
  };

  var deploymentGuide : ?DeploymentGuide = null;

  public shared ({ caller }) func saveDeploymentGuide(guide : DeploymentGuide) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can save deployment guides");
    };
    deploymentGuide := ?guide;
  };

  public query ({ caller }) func getDeploymentGuide() : async ?DeploymentGuide {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view deployment guides");
    };
    deploymentGuide;
  };

  public type FreelancerDeploymentGuide = {
    content : Text;
    createdAt : Time.Time;
    lastModified : Time.Time;
  };

  var freelancerDeploymentGuide : ?FreelancerDeploymentGuide = null;

  public shared ({ caller }) func saveFreelancerDeploymentGuide(guide : FreelancerDeploymentGuide) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can save freelancer deployment guides");
    };
    freelancerDeploymentGuide := ?guide;
  };

  public query ({ caller }) func getFreelancerDeploymentGuide() : async ?FreelancerDeploymentGuide {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view freelancer deployment guides");
    };
    freelancerDeploymentGuide;
  };

  public type FinalDeploymentDocument = {
    content : Text;
    createdAt : Time.Time;
    lastModified : Time.Time;
  };

  var finalDeploymentDocument : ?FinalDeploymentDocument = null;

  public shared ({ caller }) func saveFinalDeploymentDocument(document : FinalDeploymentDocument) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can save final deployment documents");
    };
    finalDeploymentDocument := ?document;
  };

  public query ({ caller }) func getFinalDeploymentDocument() : async ?FinalDeploymentDocument {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view final deployment documents");
    };
    finalDeploymentDocument;
  };

  public type DeploymentChecklist = {
    serverPreparation : Bool;
    appDeployment : Bool;
    wireGuardConfigGeneration : Bool;
    protonVpnIntegration : Bool;
    verificationMonitoring : Bool;
  };

  var deploymentChecklist : DeploymentChecklist = {
    serverPreparation = false;
    appDeployment = false;
    wireGuardConfigGeneration = false;
    protonVpnIntegration = false;
    verificationMonitoring = false;
  };

  public shared ({ caller }) func updateDeploymentChecklist(checklist : DeploymentChecklist) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update checklist");
    };
    deploymentChecklist := checklist;
  };

  public query ({ caller }) func getDeploymentChecklist() : async DeploymentChecklist {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view checklist");
    };
    deploymentChecklist;
  };

  public type DetailedDeploymentStep = {
    title : Text;
    description : Text;
    commands : [Text];
    completed : Bool;
  };

  public type DetailedDeploymentChecklist = {
    serverPreparation : [DetailedDeploymentStep];
    appDeployment : [DetailedDeploymentStep];
    wireGuardConfigGeneration : [DetailedDeploymentStep];
    protonVpnIntegration : [DetailedDeploymentStep];
    verificationMonitoring : [DetailedDeploymentStep];
  };

  var detailedDeploymentChecklist : DetailedDeploymentChecklist = {
    serverPreparation = [];
    appDeployment = [];
    wireGuardConfigGeneration = [];
    protonVpnIntegration = [];
    verificationMonitoring = [];
  };

  public query ({ caller }) func getDetailedDeploymentChecklist() : async DetailedDeploymentChecklist {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view detailed checklist");
    };

    let serverPreparationStepsArray = [{
      title = "SSH Login";
      description = "Connect to the server via SSH using your credentials.";
      commands = ["ssh ubuntu@<server-ip>"];
      completed = false;
    }, {
      title = "System Update";
      description = "Update system packages and dependencies.";
      commands = [
        "sudo apt-get update",
        "sudo apt-get upgrade",
      ];
      completed = false;
    }, {
      title = "Install Dependencies";
      description = "Install required packages (curl, git, etc.).";
      commands = [
        "sudo apt-get install curl git docker.io wireguard",
        "sudo systemctl enable docker",
      ];
      completed = false;
    }];

    let appDeploymentStepsArray = [{
      title = "Upload App Archive";
      description = "Use scp to upload the app archive to the server.";
      commands = [
        "scp ~/vpn-dashboard.zip ubuntu@<server-ip>:/home/ubuntu",
      ];
      completed = false;
    }, {
      title = "Extract and Deploy";
      description = "Unzip the archive and run dfx deploy.";
      commands = [
        "unzip vpn-dashboard.zip",
        "cd vpn-dashboard",
        "dfx deploy",
      ];
      completed = false;
    }];

    let wireGuardConfigStepsArray = [{
      title = "Peers Tab";
      description = "Use the dashboard's Peers tab to create server/client pairs.";
      commands = [];
      completed = false;
    }, {
      title = "Export Configurations";
      description = "Export .conf files and QR codes for clients.";
      commands = [];
      completed = false;
    }];

    let protonVpnStepsArray = [{
      title = "Enter Credentials";
      description = "Use the dashboard to enter Proton VPN credentials.";
      commands = [];
      completed = false;
    }, {
      title = "Select 10 Gbps Servers";
      description = "Filter and select low-load 10 Gbps servers.";
      commands = [];
      completed = false;
    }];

    let verificationStepsArray = [{
      title = "Dashboard Verification";
      description = "Check the dashboard for tunnel health and performance metrics.";
      commands = [];
      completed = false;
    }];

    {
      serverPreparation = serverPreparationStepsArray;
      appDeployment = appDeploymentStepsArray;
      wireGuardConfigGeneration = wireGuardConfigStepsArray;
      protonVpnIntegration = protonVpnStepsArray;
      verificationMonitoring = verificationStepsArray;
    };
  };

  public shared ({ caller }) func updateDetailedDeploymentChecklist(checklist : DetailedDeploymentChecklist) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update detailed checklist");
    };
    let serverComplete = checklist.serverPreparation.foldLeft(
      true,
      func(acc, step) { acc and step.completed },
    );
    let appComplete = checklist.appDeployment.foldLeft(
      true,
      func(acc, step) { acc and step.completed },
    );
    let wireGuardComplete = checklist.wireGuardConfigGeneration.foldLeft(
      true,
      func(acc, step) { acc and step.completed },
    );
    let protonComplete = checklist.protonVpnIntegration.foldLeft(
      true,
      func(acc, step) { acc and step.completed },
    );
    let verificationComplete = checklist.verificationMonitoring.foldLeft(
      true,
      func(acc, step) { acc and step.completed },
    );

    deploymentChecklist := {
      serverPreparation = serverComplete;
      appDeployment = appComplete;
      wireGuardConfigGeneration = wireGuardComplete;
      protonVpnIntegration = protonComplete;
      verificationMonitoring = verificationComplete;
    };
  };

  public query ({ caller }) func getChecklistProgress() : async DeploymentChecklist {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view checklist progress");
    };
    deploymentChecklist;
  };
};
