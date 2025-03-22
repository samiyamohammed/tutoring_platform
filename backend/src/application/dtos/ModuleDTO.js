class ModuleDTO {
    constructor(module) {
        this.id = module._id;
        this.course = module.course;
        this.title = module.title;
        this.content = module.content;
        this.order = module.order;
        this.createdAt = module.createdAt;
        this.updatedAt = module.updatedAt;
    }
}

export default ModuleDTO;
