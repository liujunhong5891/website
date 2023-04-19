(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{275:function(e,t,n){e.exports=n.p+"assets/img/brief-architecture.471aa7ce.png"},419:function(e,t,n){"use strict";n.r(t);var r=n(14),i=Object(r.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"overview"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#overview"}},[e._v("#")]),e._v(" Overview")]),e._v(" "),t("p",[e._v("Nautes is a Kubernetes-native all-in-one Internal Developer Platform that combines the concepts and best practices of DevOps and GitOps. It integrates the industry's best cloud-native open-source projects in a pluggable manner.")]),e._v(" "),t("h2",{attrs:{id:"features"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#features"}},[e._v("#")]),e._v(" Features")]),e._v(" "),t("ul",[t("li",[e._v("a Kubernetes-native all-in-one Internal Developer Platform that covers the entire process, including agile development, CI/CD, automated testing, security, and operations.")]),e._v(" "),t("li",[e._v("Following the best practices of GitOps, the version control repository serves as the single source of truth. When data in the repository changes, the Operator automatically detects the changes and performs incremental updates to the Kubernetes cluster.")]),e._v(" "),t("li",[e._v("A fully distributed multi-tenant architecture, where tenants serve as distributed computing and storage units that support horizontal scaling. The resources hosted by tenants also support horizontal scaling.")]),e._v(" "),t("li",[e._v("Good adaptability, In addition to the base Kubernetes and Git, other components can be replaced.")]),e._v(" "),t("li",[e._v("All features are provided with declarative REST APIs, supporting secondary development.")]),e._v(" "),t("li",[e._v("For all integrated open-source projects, their native features are maintained without any trimmed encapsulation, ensuring that there is no secondary binding for the hosted applications.")]),e._v(" "),t("li",[e._v("By constructing a higher-level data model, unified authentication and authorization are achieved for all integrated open-source projects.")]),e._v(" "),t("li",[e._v("Supports deployment modes for private cloud and hybrid cloud.")])]),e._v(" "),t("h2",{attrs:{id:"architecture"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#architecture"}},[e._v("#")]),e._v(" Architecture")]),e._v(" "),t("p",[e._v("Nautes adopts a fully distributed multi-tenant architecture, where the platform management cluster is responsible for tenant allocation and recovery. Each tenant has exclusive access to a set of resources, including code repositories, key repositories, artifact repositories, authentication servers, and clusters. Resources within a tenant are managed by the tenant management cluster.")]),e._v(" "),t("p",[e._v("Tenants serve as the unit of resource management which can be divided by users based on their organization's characteristics, such as by product teams, departments, or subsidiaries.")]),e._v(" "),t("p",[e._v("Resources within a tenant can also be deployed with multiple instances, for example, multiple Harbor instances can be deployed within a single tenant to isolate container image data for different products.")]),e._v(" "),t("p",[t("img",{attrs:{src:n(275),alt:""}})]),e._v(" "),t("h2",{attrs:{id:"entity-definition"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#entity-definition"}},[e._v("#")]),e._v(" Entity Definition")]),e._v(" "),t("ul",[t("li",[t("strong",[e._v("Product:")]),e._v(" Corresponds to a software system, including teams, projects, environments, code repositories, artifact repositories, and runtime. A product can be authorized by the Tenant Manager for use on specified Kubernetes clusters.")]),e._v(" "),t("li",[t("strong",[e._v("Project:")]),e._v(" Corresponds to a microservice, and each project has its own code repository. You can use a cluster for project integration and deployment, or use the artifact repository of the product to store and version control the project artifacts. A product can contain multiple projects.")]),e._v(" "),t("li",[t("strong",[e._v("Environment:")]),e._v(" A management unit that uses  a cluster to host the integration and deployment of various microservices in the product. Currently, we only support the Kubernetes cluster type. A product contains multiple environments, such as development, testing, pre-production, and production environments.")]),e._v(" "),t("li",[t("strong",[e._v("Code Repository:")]),e._v(" A repository used for storing a project's source code, pipeline configurations, or deployment manifests. Only Git is supported.")]),e._v(" "),t("li",[t("strong",[e._v("Pipeline Runtime:")]),e._v(" The configuration declaration defining the aspects for integrating a project's pipeline, such as: the storage location of pipeline configurations, the pipeline's triggering method, the target environment for running the pipeline, etc.")]),e._v(" "),t("li",[t("strong",[e._v("Deployment Runtime:")]),e._v(" The configuration declaration defining the aspects for deploying projects, such as: the storage location of deployment manifests, the target environment to deploy to, etc.")])])])}),[],!1,null,null,null);t.default=i.exports}}]);