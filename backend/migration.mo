import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  type UserProfile = {
    name : Text;
  };

  type DeploymentStep = {
    title : Text;
    description : Text;
    commands : [Text];
    completed : Bool;
  };

  type DetailedChecklist = {
    serverPreparation : [DeploymentStep];
    appDeployment : [DeploymentStep];
    wireGuardConfigGeneration : [DeploymentStep];
    protonVpnIntegration : [DeploymentStep];
    verificationMonitoring : [DeploymentStep];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    deploymentChecklist : {
      serverPreparation : Bool;
      appDeployment : Bool;
      wireGuardConfigGeneration : Bool;
      protonVpnIntegration : Bool;
      verificationMonitoring : Bool;
    };
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    detailedDeploymentChecklist : DetailedChecklist;
    deploymentChecklist : {
      serverPreparation : Bool;
      appDeployment : Bool;
      wireGuardConfigGeneration : Bool;
      protonVpnIntegration : Bool;
      verificationMonitoring : Bool;
    };
  };

  public func run(old : OldActor) : NewActor {
    let initialSteps = [
      {
        title = "Placeholder Step";
        description = "This is a placeholder step.";
        commands = [];
        completed = false;
      },
    ];

    let detailedChecklist = {
      serverPreparation = initialSteps;
      appDeployment = initialSteps;
      wireGuardConfigGeneration = initialSteps;
      protonVpnIntegration = initialSteps;
      verificationMonitoring = initialSteps;
    };

    {
      old with
      detailedDeploymentChecklist = detailedChecklist;
    };
  };
};
