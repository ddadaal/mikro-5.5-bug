import "reflect-metadata";

import { MikroORM, Collection, Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Reference } from "@mikro-orm/core";
import { MySqlOptions } from "@mikro-orm/mysql/MySqlMikroORM";
import { join } from "path";

export enum Enum1 {
    A = "A",
}

@Entity()
export class User {
    @PrimaryKey()
    id: number;
    
    @OneToMany(() => UserAccount, (u) => u.user)
    userAccounts = new Collection<UserAccount>(this);

    @Enum({ items: () => Enum1, array: true })
    enum1: Enum1[] = [];

    constructor(init: {
        id: number;
        enum1?: Enum1[];
    }) {
        this.id = init.id;
        this.enum1 = init.enum1 ?? [];
    }
}

@Entity()
export class UserAccount {
    @PrimaryKey()
    id: number;

    @ManyToOne(() => User, { onDelete: "CASCADE", wrappedReference: true })
    user: Reference<User>;

    constructor(init: {
        id: number;
        user: Reference<User>
    }) {
        this.id = init.id;
        this.user = init.user;
    }
}

export const ormOptions = (): MySqlOptions => ({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "123asd!@#",
    type: "mysql",
    dbName: "test",
     entities: [User, UserAccount],
})

async function main() {
    const options = ormOptions();

    const orm = await MikroORM.init(options);
    const schemaGenerator = orm.getSchemaGenerator();

    try {
        await schemaGenerator.ensureDatabase();
        await schemaGenerator.updateSchema();
        
        // Error will occur if the enum is not set
        const user = new User({ id: 1 });

        // No error will occur if enum1 is set
        // const user = new User({ id: 1, enum1 });

        const ua = new UserAccount({ id: 1, user: Reference.create(user)});
        await orm.em.fork().persistAndFlush([user, ua]);

        // works
        const foundUser = await orm.em.fork().find(User, {});
        console.log("Get user", foundUser);

        // throws
        const foundUA = await orm.em.fork().find(UserAccount, {}, { populate: ["user"]});
        console.log("Get UA", foundUA);

    } finally {
        await schemaGenerator.dropDatabase(options.dbName!); 
        await orm.close();
    }
}

main();