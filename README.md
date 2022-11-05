# mikro-orm 5.5 bug reproduction

MikroORM 5.5 throws the following error at the following situation

1. there are two entities (say `User` and `UserAccount`)
2. `User` has a enum array property (say `enum1` of enum type `Enum1`)
3. `User` and `UserAccount` are of one-to-many relationship (a `User` might have multiple `UserAccount`)
4. an `User` entity instance has `enum1` set to empty array `[]`
5. find `UserAccount` and populate `user` (`em.find(UserAccount, {}, { populate: ["user"]})`)

```
JIT runtime error: Cannot read properties of undefined (reading 'length')

  function(last, current) {
    const diff = {};
    if (current.id == null && last.id == null) {
  
    } else if ((current.id && last.id == null) || (current.id == null && last.id)) {
      diff.id = current.id;
    } else if (last.id !== current.id) {
      diff.id = current.id;
    }
  
    if (current.enum1 == null && last.enum1 == null) {
  
    } else if ((current.enum1 && last.enum1 == null) || (current.enum1 == null && last.enum1)) {
      diff.enum1 = current.enum1;
>   } else if (!compareArrays(last.enum1, current.enum1)) {
               ^
      diff.enum1 = current.enum1;
    }
  
    return diff;
  }
```

# Run

```bash
# install dependencies
pnpm i

# start local mysql 8 server
docker compose up -d

# When the db is up, run src/index.ts
pnpm start
```