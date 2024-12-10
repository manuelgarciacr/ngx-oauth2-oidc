import { getType } from "../domain";
import { setStore } from "./_store";
/**
 * Converts an object of string type parameters to an IOAuth2Parameters object
 *   and saves the new configuration parameters. Converts the "expires_in" parameter
 *   in a Epoch date (milliseconds)
 *
 * @param obj The object of string type parameters
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @returns An IOAuth2Parameters object
 */
export const updateParameters = (obj, config // Passed by reference and updated (configuration.parameters)
) => {
    const storage = config.configuration?.storage;
    const newObj = {}; //<IOAuth2Parameters>{};
    // TODO: test number and boolean conversion
    for (const key in obj) {
        const newKey = key;
        const value = obj[key];
        const type = getType(newKey);
        const newValue = type == "array"
            ? value.split(" ")
            : type == "number"
                ? JSON.parse(value)
                : type == "boolean"
                    ? JSON.parse(value)
                    : value;
        newObj[key] = newValue;
    }
    if (newObj["expires_in"]) {
        newObj["expires_in"] =
            new Date().getTime() + newObj["expires_in"] * 1000;
    }
    config.parameters = {
        ...config.parameters,
        ...newObj,
    };
    setStore("config", storage
        ? config
        : null);
    return newObj;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3VwZGF0ZVBhcmFtZXRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtb2F1dGgyLW9pZGMvc3JjL2xpYi9fdXBkYXRlUGFyYW1ldGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQTBELE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUM1RixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXBDOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLENBQzVCLEdBQThCLEVBQzlCLE1BQXFCLENBQUMsNkRBQTZEO0VBQ3JGLEVBQUU7SUFDQSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQztJQUM5QyxNQUFNLE1BQU0sR0FBeUIsRUFBRSxDQUFDLENBQUMsd0JBQXdCO0lBRWpFLDJDQUEyQztJQUMzQyxLQUFLLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sTUFBTSxHQUFHLEdBQThCLENBQUM7UUFDOUMsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixNQUFNLFFBQVEsR0FDVixJQUFJLElBQUksT0FBTztZQUNYLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUNsQixDQUFDLENBQUMsSUFBSSxJQUFJLFFBQVE7Z0JBQ2xCLENBQUMsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBWTtnQkFDL0IsQ0FBQyxDQUFDLElBQUksSUFBSSxTQUFTO29CQUNuQixDQUFDLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQWE7b0JBQ2hDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFZixNQUFNLENBQUMsR0FBRyxDQUFhLEdBQUcsUUFBUSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDaEIsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBSSxNQUFNLENBQUMsWUFBWSxDQUFZLEdBQUcsSUFBSSxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxNQUFNLENBQUMsVUFBVSxHQUFHO1FBQ2hCLEdBQUcsTUFBTSxDQUFDLFVBQVU7UUFDcEIsR0FBRyxNQUFNO0tBQ1osQ0FBQztJQUVGLFFBQVEsQ0FDSixRQUFRLEVBQ1IsT0FBTztRQUNILENBQUMsQ0FBQyxNQUFNO1FBQ1IsQ0FBQyxDQUFDLElBQUksQ0FDYixDQUFDO0lBRUYsT0FBTyxNQUEyQixDQUFDO0FBQ3ZDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElPQXV0aDJDb25maWcsIElPQXV0aDJQYXJhbWV0ZXJzLCBjdXN0b21QYXJhbWV0ZXJzVHlwZSwgZ2V0VHlwZSB9IGZyb20gXCIuLi9kb21haW5cIjtcbmltcG9ydCB7IHNldFN0b3JlIH0gZnJvbSBcIi4vX3N0b3JlXCI7XG5cbi8qKlxuICogQ29udmVydHMgYW4gb2JqZWN0IG9mIHN0cmluZyB0eXBlIHBhcmFtZXRlcnMgdG8gYW4gSU9BdXRoMlBhcmFtZXRlcnMgb2JqZWN0XG4gKiAgIGFuZCBzYXZlcyB0aGUgbmV3IGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycy4gQ29udmVydHMgdGhlIFwiZXhwaXJlc19pblwiIHBhcmFtZXRlclxuICogICBpbiBhIEVwb2NoIGRhdGUgKG1pbGxpc2Vjb25kcylcbiAqXG4gKiBAcGFyYW0gb2JqIFRoZSBvYmplY3Qgb2Ygc3RyaW5nIHR5cGUgcGFyYW1ldGVyc1xuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIG9iamVjdCBzYXZlZCBpbiBtZW1vcnkuIFBhc3NlZCBieSByZWZlcmVuY2UgYW5kXG4gKiAgICAgIHVwZGF0ZWQgKGNvbmZpZ3VyYXRpb24ucGFyYW1ldGVycylcbiAqIEByZXR1cm5zIEFuIElPQXV0aDJQYXJhbWV0ZXJzIG9iamVjdFxuICovXG5leHBvcnQgY29uc3QgdXBkYXRlUGFyYW1ldGVycyA9IChcbiAgICBvYmo6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgY29uZmlnOiBJT0F1dGgyQ29uZmlnIC8vIFBhc3NlZCBieSByZWZlcmVuY2UgYW5kIHVwZGF0ZWQgKGNvbmZpZ3VyYXRpb24ucGFyYW1ldGVycylcbikgPT4ge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBjb25maWcuY29uZmlndXJhdGlvbj8uc3RvcmFnZTtcbiAgICBjb25zdCBuZXdPYmogPSA8Y3VzdG9tUGFyYW1ldGVyc1R5cGU+e307IC8vPElPQXV0aDJQYXJhbWV0ZXJzPnt9O1xuXG4gICAgLy8gVE9ETzogdGVzdCBudW1iZXIgYW5kIGJvb2xlYW4gY29udmVyc2lvblxuICAgIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkgYXMga2V5b2YgSU9BdXRoMlBhcmFtZXRlcnM7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG4gICAgICAgIGNvbnN0IHR5cGUgPSBnZXRUeXBlKG5ld0tleSk7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID1cbiAgICAgICAgICAgIHR5cGUgPT0gXCJhcnJheVwiXG4gICAgICAgICAgICAgICAgPyB2YWx1ZS5zcGxpdChcIiBcIilcbiAgICAgICAgICAgICAgICA6IHR5cGUgPT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgICAgID8gKEpTT04ucGFyc2UodmFsdWUpIGFzIG51bWJlcilcbiAgICAgICAgICAgICAgICA6IHR5cGUgPT0gXCJib29sZWFuXCJcbiAgICAgICAgICAgICAgICA/IChKU09OLnBhcnNlKHZhbHVlKSBhcyBib29sZWFuKVxuICAgICAgICAgICAgICAgIDogdmFsdWU7XG5cbiAgICAgICAgKG5ld09ialtrZXldIGFzIHVua25vd24pID0gbmV3VmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKG5ld09ialtcImV4cGlyZXNfaW5cIl0pIHtcbiAgICAgICAgbmV3T2JqW1wiZXhwaXJlc19pblwiXSA9XG4gICAgICAgICAgICBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIChuZXdPYmpbXCJleHBpcmVzX2luXCJdIGFzIG51bWJlcikgKiAxMDAwO1xuICAgIH1cblxuICAgIGNvbmZpZy5wYXJhbWV0ZXJzID0ge1xuICAgICAgICAuLi5jb25maWcucGFyYW1ldGVycyxcbiAgICAgICAgLi4ubmV3T2JqLFxuICAgIH07XG5cbiAgICBzZXRTdG9yZShcbiAgICAgICAgXCJjb25maWdcIixcbiAgICAgICAgc3RvcmFnZVxuICAgICAgICAgICAgPyBjb25maWdcbiAgICAgICAgICAgIDogbnVsbFxuICAgICk7XG5cbiAgICByZXR1cm4gbmV3T2JqIGFzIElPQXV0aDJQYXJhbWV0ZXJzO1xufTtcbiJdfQ==